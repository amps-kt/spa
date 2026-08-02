import { Grade } from "@/logic/grading";

import {
  type UnitGradeDTO,
  type DraftMarkingSubmissionDTO,
  type FullMarkingSubmissionDTO,
  type UnitOfAssessmentDTO,
  type FinalMarkingResult,
} from "@/dto";

import { type DataAccessScope, ScopedDataObject } from "@/db/scope";
import { Transformers as T } from "@/db/transformers";
import { ConsensusMethod, ConsensusStage } from "@/db/types";

import { expand } from "@/lib/utils/instance-params";
import { keyBy } from "@/lib/utils/key-by";
import { type InstanceParams } from "@/lib/validations/params";

import { AllocationInstance } from ".";

type MarkerId = string;

export class UnitOfAssessment extends ScopedDataObject {
  public instance: AllocationInstance;

  public id: string;

  constructor(sc: DataAccessScope, params: InstanceParams, unitId: string) {
    super(sc);
    this.instance = new AllocationInstance(sc, params);
    this.id = unitId;
  }

  public async toDTO(): Promise<UnitOfAssessmentDTO> {
    const data = await this.db.unitOfAssessment.findUniqueOrThrow({
      where: { id: this.id },
      include: { flag: true, markingComponents: true },
    });

    return T.toUnitOfAssessmentDTO(data);
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
    await this.sc.batch([
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

    await this.sc.batch([
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

  async unsubmitMarks({
    markerId,
    studentId,
  }: {
    markerId: string;
    studentId: string;
  }): Promise<void> {
    const unitOfAssessmentId = this.id;

    await this.sc.batch([
      this.db.unitOfAssessmentSubmission.update({
        where: { uoaSubmissionId: { markerId, studentId, unitOfAssessmentId } },
        data: { draft: true },
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

  public async updateFinalMark(
    studentId: string,
    newData: FinalMarkingResult,
  ): Promise<UnitGradeDTO> {
    await this.sc.batch([
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

    const data = await this.db.unitOfAssessmentGrade.findUniqueOrThrow({
      where: { uoaGradeId: { studentId, unitOfAssessmentId: this.id } },
      include: { gradeEntries: true },
    });

    return T.toUnitGradeDTO(data);
  }
}
