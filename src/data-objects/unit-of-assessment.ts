import {
  type UnitGradeDTO,
  type DraftMarkingSubmissionDTO,
  type FullMarkingSubmissionDTO,
  type UnitOfAssessmentDTO,
  type FinalMarkingResult,
} from "@/dto";

import { Transformers as T } from "@/db/transformers";
import { type DB } from "@/db/types";

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

  public async updateFinalMark(studentId: string, newData: FinalMarkingResult) {
    await this.db.unitOfAssessmentGrade.upsert({
      where: { uoaGradeId: { unitOfAssessmentId: this.id, studentId } },
      create: {
        ...expand(this.instance.params),
        unitOfAssessmentId: this.id,
        studentId,
        ...newData,
      },
      update: newData,
    });
  }
}
