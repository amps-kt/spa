import { Grade } from "@/logic/grading";

import {
  type ProjectDTO,
  type StudentDTO,
  type UnitOfAssessmentDTO,
} from "@/dto";
import {
  markingStatusMin,
  type UnitGradingLifecycleState,
  unitToOverall,
  type StudentGradingLifecycleState,
  type UnitGradeDTO,
  type MarkingSubmissionDTO,
} from "@/dto/marking";

import { Transformers as T } from "@/db/transformers";
import { MarkerType, type DB } from "@/db/types";

import { expand } from "@/lib/utils/general/instance-params";
import { type InstanceParams } from "@/lib/validations/params";

import { AllocationInstance } from "../space/instance";

import { User } from ".";

export class Marker extends User {
  instance: AllocationInstance;

  constructor(db: DB, id: string, params: InstanceParams) {
    super(db, id);
    this.instance = new AllocationInstance(db, params);
  }

  async getAssignedMarking(
    asAdmin = false,
  ): Promise<
    {
      project: ProjectDTO;
      student: StudentDTO;
      role: MarkerType;
      status: StudentGradingLifecycleState;
      units: { unit: UnitOfAssessmentDTO; status: UnitGradingLifecycleState }[];
    }[]
  > {
    const projectsToMark = await this.db.studentProjectAllocation.findMany({
      where: {
        ...expand(this.instance.params),
        project: {
          OR: [
            { supervisorId: this.id }, // is supervisor
            { readerAllocations: { some: { readerId: this.id } } }, // is reader
          ],
        },
      },
      include: {
        project: {
          include: {
            flagsOnProject: { include: { flag: true } },
            tagsOnProject: { include: { tag: true } },
          },
        },
        student: {
          include: {
            unitSubmissions: true,
            unitGrades: true,
            userInInstance: { include: { user: true } },
            studentFlag: {
              include: {
                unitsOfAssessment: {
                  include: {
                    grades: true,
                    markingComponents: true,
                    markerSubmissions: { where: {} },
                  },
                },
              },
            },
          },
        },
      },
    });

    const user = await this.toDTO();

    return projectsToMark.map(({ student, project }) => {
      const flag = student.studentFlag;

      type UnitOfAssessmentID = string;

      const unitGrades: Record<UnitOfAssessmentID, UnitGradeDTO> =
        student.unitGrades.reduce(
          (acc, val) => ({
            ...acc,
            [val.unitOfAssessmentId]: T.toUnitGradeDTO(val),
          }),
          {},
        );

      const unitSubmissions: Record<
        UnitOfAssessmentID,
        MarkingSubmissionDTO[]
      > = student.unitSubmissions.reduce(
        (acc, val) => {
          const list = acc[val.unitOfAssessmentId] ?? [];
          return {
            ...acc,
            [val.unitOfAssessmentId]: [...list, T.toMarkingSubmissionDTO(val)],
          };
        },
        {} as Record<UnitOfAssessmentID, MarkingSubmissionDTO[]>,
      );

      const units = flag.unitsOfAssessment.map((x) => {
        const unit = T.toUnitOfAssessmentDTO({ ...x, flag });
        const status = Grade.getUnitStatus(
          unit,
          unitGrades[unit.id],
          unitSubmissions[unit.id] ?? [],
          asAdmin ? undefined : user,
        );

        return { unit, status };
      });

      const status = markingStatusMin(
        units.map((x) => unitToOverall(x.status)),
      );

      const role =
        project.supervisorId == this.id
          ? MarkerType.SUPERVISOR
          : MarkerType.READER;

      return {
        project: T.toProjectDTO(project),
        student: T.toStudentDTO(student),
        role,
        status,
        units,
      };
    });
  }

  public async getMarkerType(studentId: string): Promise<MarkerType> {
    if (await this.isSupervisor(this.instance.params)) {
      const supervisor = await this.toSupervisor(this.instance.params);
      const allocations = await supervisor.getSupervisionAllocations();

      const allocation = allocations.find((a) => a.student.id === studentId);
      if (allocation !== undefined) return MarkerType.SUPERVISOR;
    }

    if (await this.isReader(this.instance.params)) {
      const reader = await this.toReader(this.instance.params);
      const allocations = await reader.getAllocations();

      const allocation = allocations.find((a) => a.student.id === studentId);
      if (allocation !== undefined) return MarkerType.READER;
    }

    throw new Error("User is not a marker for this student");
  }
}
