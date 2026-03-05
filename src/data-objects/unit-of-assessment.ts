import { Grade } from "@/logic/grading";

import {
  type UnitGradeDTO,
  type DraftMarkingSubmissionDTO,
  type FullMarkingSubmissionDTO,
  type UnitOfAssessmentDTO,
  type FinalMarkingResult,
} from "@/dto";

import { Transformers as T } from "@/db/transformers";
import { ConsensusMethod, ConsensusStage, type DB } from "@/db/types";

import { expand } from "@/lib/utils/general/instance-params";
import { keyBy } from "@/lib/utils/general/key-by";
import { type InstanceParams } from "@/lib/validations/params";

import { DataObject } from "./data-object";

import { AllocationInstance } from ".";

type MarkerId = string;

export class UnitOfAssessment extends DataObject {
  public instance: AllocationInstance;

  public id: string;

  constructor(db: DB, params: InstanceParams, unitId: string) {
    super(db);
    this.instance = new AllocationInstance(db, params);
    this.id = unitId;
  }

  public async getMarks(
    studentId: string,
  ): Promise<{
    unit: UnitOfAssessmentDTO;
    grade?: UnitGradeDTO;
    marks: Record<
      MarkerId,
      DraftMarkingSubmissionDTO | FullMarkingSubmissionDTO
    >;
  }> {
    const data = await this.db.unitOfAssessment.findFirstOrThrow({
      where: { id: this.id },
      include: {
        markingComponents: true,
        flag: true,

        grades: {
          where: {
            student: { ...expand(this.instance.params), userId: studentId },
          },
          include: { gradeEntries: { orderBy: { timestamp: "desc" } } },
        },
        markerSubmissions: {
          where: {
            student: { ...expand(this.instance.params), userId: studentId },
          },
          include: { criterionScores: true },
        },
      },
    });

    const grade = data.grades.at(0);

    const marks = keyBy(
      data.markerSubmissions.map(T.toMarkingSubmissionDTO),
      (s) => s.markerId,
    );

    return {
      unit: T.toUnitOfAssessmentDTO(data),
      grade: grade && T.toUnitGradeDTO(grade),
      marks,
    };
  }

  public async writeMarks({
    markerId,
    studentId,
    draft,
    finalComment: summary,
    recommendation: recommendedForPrize,
    grade,
    marks,
  }: FullMarkingSubmissionDTO | DraftMarkingSubmissionDTO) {
    const unitOfAssessmentId = this.id;
    await this.db.$transaction([
      this.db.unitOfAssessmentSubmission.upsert({
        where: { uoaSubmissionId: { markerId, studentId, unitOfAssessmentId } },
        create: {
          ...expand(this.instance.params),
          markerId,
          studentId,
          unitOfAssessmentId,
          draft,
          summary,
          recommendedForPrize,
          grade,
        },
        update: { draft, summary, recommendedForPrize, grade },
      }),

      ...Object.entries(marks).map(
        ([markingComponentId, { mark: grade, justification }]) =>
          this.db.markingComponentSubmission.upsert({
            where: {
              markingComponentSubmission: {
                markerId,
                studentId,
                markingComponentId,
              },
            },
            create: {
              ...expand(this.instance.params),
              markerId,
              studentId,
              markingComponentId,
              unitOfAssessmentId,
              grade,
              justification,
            },
            update: { grade, justification },
          }),
      ),
    ]);
  }

  async resetMarks({
    markerId,
    studentId,
  }: {
    markerId: string;
    studentId: string;
  }): Promise<void> {
    const unitOfAssessmentId = this.id;

    await this.db.$transaction([
      this.db.unitOfAssessmentSubmission.delete({
        where: { uoaSubmissionId: { markerId, studentId, unitOfAssessmentId } },
      }),

      this.db.unitOfAssessmentGrade.upsert({
        where: { uoaGradeId: { studentId, unitOfAssessmentId } },
        create: {
          studentId,
          unitOfAssessmentId,
          status: ConsensusStage.UNRESOLVED,
          ...expand(this.instance.params),
        },
        update: { status: ConsensusStage.UNRESOLVED },
      }),

      this.db.gradeEntry.deleteMany({
        where: { unitOfAssessmentId, studentId },
      }),
    ]);
  }

  public async updateFinalMark(studentId: string, newData: FinalMarkingResult) {
    await this.db.$transaction([
      this.db.unitOfAssessmentGrade.upsert({
        where: { uoaGradeId: { unitOfAssessmentId: this.id, studentId } },
        create: {
          ...expand(this.instance.params),
          unitOfAssessmentId: this.id,
          studentId,
          status: newData.status,
        },
        update: { status: newData.status },
      }),

      ...(newData.status === ConsensusStage.MODERATE_AFTER_NEGOTIATION
        ? [
            this.db.gradeEntry.upsert({
              where: {
                unitOfAssessmentId_studentId_method: {
                  method: ConsensusMethod.NEGOTIATED,
                  unitOfAssessmentId: this.id,
                  studentId,
                },
              },
              create: {
                comment: newData.comment,
                grade: newData.grade,
                method: ConsensusMethod.NEGOTIATED,
                unitOfAssessmentId: this.id,
                studentId,
              },
              update: { comment: newData.comment, grade: newData.grade },
            }),
          ]
        : []),

      ...(newData.status === ConsensusStage.RESOLVED
        ? [
            this.db.gradeEntry.upsert({
              where: {
                unitOfAssessmentId_studentId_method: {
                  method: newData.method,
                  unitOfAssessmentId: this.id,
                  studentId,
                },
              },
              create: {
                comment: newData.comment,
                grade: newData.grade,
                method: newData.method,
                unitOfAssessmentId: this.id,
                studentId,
              },
              update: { comment: newData.comment, grade: newData.grade },
            }),
          ]
        : []),
    ]);

    if (newData.status === ConsensusStage.RESOLVED) {
      const allGrades = await this.db.unitOfAssessmentGrade.findMany({
        where: { studentId, ...expand(this.instance.params) },
        include: {
          gradeEntries: { orderBy: { timestamp: "desc" }, take: 1 },
          unitOfAssessment: true,
        },
      });

      if (
        allGrades.every(
          (g) => g.status === "RESOLVED" && g.gradeEntries[0].grade,
        )
      ) {
        const data = allGrades.map((g) => ({
          score: g.gradeEntries[0].grade,
          weight: g.customWeight ?? g.unitOfAssessment.defaultWeight,
        }));

        const finalGrade = Grade.weightedAverage(data);

        await this.db.finalGrade.upsert({
          where: {
            finalGradeUnique: { studentId, ...expand(this.instance.params) },
          },
          create: {
            ...expand(this.instance.params),
            studentId,
            grade: finalGrade,
          },
          update: { grade: finalGrade },
        });
      }
    }
  }
}
