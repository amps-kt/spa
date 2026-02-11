import {
  type MarkingSubmissionDTO,
  type ProjectDTO,
  type StudentDTO,
  type UnitOfAssessmentDTO,
  type PartialMarkingSubmissionDTO,
} from "@/dto";
import {
  markingStatusMin,
  type UnitMarkingStatus,
  unitToOverall,
  type OverallMarkingStatus,
  type UnitGradeDTO,
} from "@/dto/marking";
import { MarkingSubmissionStatus } from "@/dto/result/marking-submission-status";

import { Transformers as T } from "@/db/transformers";
import { MarkerType, type DB } from "@/db/types";

import { expand } from "@/lib/utils/general/instance-params";
import { type InstanceParams } from "@/lib/validations/params";

import { Grading } from "../grading";
import { AllocationInstance } from "../space/instance";

import { User } from ".";

export class Marker extends User {
  /**
   * @deprecated
   */
  public static computeStatus(
    u: UnitOfAssessmentDTO,
    submission: MarkingSubmissionDTO | undefined,
  ): MarkingSubmissionStatus {
    if (!u.isOpen) {
      return MarkingSubmissionStatus.CLOSED;
    } else if (!submission) {
      return MarkingSubmissionStatus.OPEN;
    } else if (submission.draft) {
      return MarkingSubmissionStatus.DRAFT;
    } else {
      return MarkingSubmissionStatus.SUBMITTED;
    }
  }

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
      status: OverallMarkingStatus;
      units: { unit: UnitOfAssessmentDTO; status: UnitMarkingStatus }[];
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
        const status = Grading.getUnitStatus(
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

  async getMarkingSubmission(
    unitOfAssessmentId: string,
    studentId: string,
  ): Promise<MarkingSubmissionDTO> {
    const result = await this.db.unitOfAssessmentSubmission.findFirst({
      where: { markerId: this.id, studentId, unitOfAssessmentId },
      include: { criterionScores: true },
    });

    console.log(result);

    if (result) return T.toMarkingSubmissionDTO(result);

    return {
      unitOfAssessmentId,
      studentId,
      grade: -1,
      markerId: this.id,
      draft: true,
      marks: {},
      finalComment: "",
      recommendation: false,
    };
  }

  public async getProjectsWithSubmissions(): Promise<
    {
      project: ProjectDTO;
      student: StudentDTO;
      markerType: MarkerType;
      unitsOfAssessment: {
        unit: UnitOfAssessmentDTO;
        status: MarkingSubmissionStatus;
      }[];
    }[]
  > {
    type Ret = Awaited<ReturnType<typeof this.getProjectsWithSubmissions>>;
    let assignedProjects: Ret = [];

    const markerId = this.id;

    if (await this.isSupervisor(this.instance.params)) {
      const data = await this.db.studentProjectAllocation.findMany({
        where: {
          ...expand(this.instance.params),
          project: { supervisorId: this.id },
        },
        include: {
          student: {
            include: {
              userInInstance: { include: { user: true } },
              studentFlag: {
                include: {
                  unitsOfAssessment: {
                    where: { allowedMarkerTypes: { has: "SUPERVISOR" } },
                    include: {
                      markingComponents: true,
                      flag: true,
                      markerSubmissions: { where: { markerId } },
                    },
                  },
                },
              },
            },
          },
          project: {
            include: {
              flagsOnProject: { include: { flag: true } },
              tagsOnProject: { include: { tag: true } },
            },
          },
        },
      });

      assignedProjects = assignedProjects.concat(
        data.flatMap((a) => ({
          project: T.toProjectDTO(a.project),
          student: T.toStudentDTO(a.student),
          markerType: MarkerType.SUPERVISOR,
          unitsOfAssessment: a.student.studentFlag.unitsOfAssessment.map(
            (u) => {
              const submission = u.markerSubmissions.find(
                (s) => s.studentId === a.student.userId,
              );

              const unit = T.toUnitOfAssessmentDTO(u);

              return {
                unit,
                status: Marker.computeStatus(
                  unit,
                  submission && T.toMarkingSubmissionDTO(submission),
                ),
              };
            },
          ),
        })),
      );
    }

    if (await this.isReader(this.instance.params)) {
      const readerAllocations = await this.db.readerProjectAllocation.findMany({
        where: { ...expand(this.instance.params), readerId: this.id },
        include: {
          project: {
            include: {
              flagsOnProject: { include: { flag: true } },
              tagsOnProject: { include: { tag: true } },
              studentAllocations: {
                include: {
                  student: {
                    include: {
                      userInInstance: { include: { user: true } },
                      studentFlag: {
                        include: {
                          unitsOfAssessment: {
                            include: {
                              markerSubmissions: true,
                              flag: true,
                              markingComponents: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      assignedProjects = assignedProjects.concat(
        readerAllocations.flatMap(({ project }) => ({
          project: T.toProjectDTO(project),
          student: T.toStudentDTO(project.studentAllocations[0].student),
          markerType: MarkerType.READER,
          unitsOfAssessment:
            project.studentAllocations[0].student.studentFlag.unitsOfAssessment.map(
              (u) => {
                const submission = u.markerSubmissions.find(
                  (s) => s.studentId === project.studentAllocations[0].userId,
                );

                const unit = T.toUnitOfAssessmentDTO(u);

                return {
                  unit,
                  status: Marker.computeStatus(
                    unit,
                    submission && T.toMarkingSubmissionDTO(submission),
                  ),
                };
              },
            ),
        })),
      );
    }

    return assignedProjects.sort((a, b) =>
      a.student.id.localeCompare(b.student.id),
    );
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

  public async writeMarks({
    unitOfAssessmentId,
    studentId,
    marks = {},
    finalComment = "",
    recommendation,
    draft,
    grade,
  }: Omit<PartialMarkingSubmissionDTO, "markerId">) {
    const markerId = this.id;
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
          summary: finalComment,
          recommendedForPrize: recommendation,
          grade,
        },
        update: {
          draft,
          summary: finalComment,
          recommendedForPrize: recommendation,
          grade: grade,
        },
      }),

      ...Object.entries(marks).map(([markingComponentId, m]) =>
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
            grade: m.mark ?? -1,
            justification: m.justification ?? "",
          },
          update: { grade: m.mark, justification: m.justification },
        }),
      ),
    ]);
  }

  public async writeFinalMark({
    studentId,
    unitOfAssessmentId,
    grade,
    comment,
  }: {
    studentId: string;
    unitOfAssessmentId: string;
    grade: number;
    comment: string;
  }) {
    await this.db.unitOfAssessmentGrade.upsert({
      where: {
        ...expand(this.instance.params),
        uoaGradeId: { studentId, unitOfAssessmentId },
      },
      create: {
        ...expand(this.instance.params),
        studentId,
        unitOfAssessmentId,
        comment,
        grade,
        status: "DONE",
        method: "AUTO",
        submitted: true,
      },
      update: { studentId, unitOfAssessmentId, comment, grade },
    });
  }
}
