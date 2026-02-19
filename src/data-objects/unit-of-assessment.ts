import {
  type UnitOfAssessmentGrade,
  type UnitOfAssessmentSubmission,
} from "@prisma/client";

import { type UnitOfAssessmentDTO } from "@/dto";

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
    grade?: UnitOfAssessmentGrade;
    marks: Record<MarkerId, UnitOfAssessmentSubmission>;
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

    return { unit: T.toUnitOfAssessmentDTO(data), grade, marks };
  }
}
