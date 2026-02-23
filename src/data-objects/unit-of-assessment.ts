import {
  type UnitGradeDTO,
  type DraftMarkingSubmissionDTO,
  type MarkingSubmissionDTO,
  type UnitOfAssessmentDTO,
} from "@/dto";

import { Transformers as T } from "@/db/transformers";
import { type DB } from "@/db/types";

import { expand } from "@/lib/utils/general/instance-params";
import { type InstanceParams } from "@/lib/validations/params";

import { DataObject } from "./data-object";

import { AllocationInstance, Student } from ".";

type MarkerId = string;

export class UnitOfAssessment extends DataObject {
  public instance: AllocationInstance;
  public student: Student;
  public id: string;

  constructor(
    db: DB,
    params: InstanceParams,
    studentId: string,
    unitId: string,
  ) {
    super(db);
    this.instance = new AllocationInstance(db, params);
    this.student = new Student(db, studentId, params);
    this.id = unitId;
  }

  public async getMarks(): Promise<{
    unit: UnitOfAssessmentDTO;
    grade?: UnitGradeDTO;
    marks: Record<MarkerId, DraftMarkingSubmissionDTO | MarkingSubmissionDTO>;
  }> {
    const data = await this.db.unitOfAssessment.findFirstOrThrow({
      where: { id: this.id },
      include: {
        markingComponents: true,
        flag: true,

        grades: {
          where: {
            student: {
              ...expand(this.instance.params),
              userId: this.student.id,
            },
          },
        },
        markerSubmissions: {
          where: {
            student: {
              ...expand(this.instance.params),
              userId: this.student.id,
            },
          },
          include: { criterionScores: true },
        },
      },
    });

    const grade = data.grades.at(0);

    const marks = data.markerSubmissions.reduce(
      (acc, val) => ({ ...acc, [val.markerId]: val }),
      {},
    );

    return {
      unit: T.toUnitOfAssessmentDTO(data),
      grade: grade && T.toUnitGradeDTO(grade),
      marks,
    };
  }

  public async getConsensus({
    studentId,
  }: {
    studentId: string;
  }): Promise<UnitGradeDTO> {
    const grade = await this.db.unitOfAssessmentGrade.findUniqueOrThrow({
      where: { uoaGradeId: { studentId, unitOfAssessmentId: this.id } },
    });

    // if (grade === null) return undefined;
    return T.toUnitGradeDTO(grade);
  }

  public async writeMarks({
    markerId,
    studentId,
    draft,
    finalComment: summary,
    recommendation: recommendedForPrize,
    grade,
    marks,
  }: MarkingSubmissionDTO | DraftMarkingSubmissionDTO) {
    const unitOfAssessmentId = this.id;
    await this.db.$transaction([
      this.db.unitOfAssessmentSubmission.upsert({
        where: {
          ...expand(this.instance.params),
          uoaSubmissionId: { markerId, studentId, unitOfAssessmentId },
        },
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
                ...expand(this.instance.params),
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
}
