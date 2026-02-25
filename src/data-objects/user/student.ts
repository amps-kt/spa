import {
  type StudentDTO,
  type ProjectDTO,
  type SupervisorDTO,
  type ReaderDTO,
  type UnitOfAssessmentDTO,
  type UnitGradeDTO,
  type FullMarkingSubmissionDTO,
  type UnitGradingLifecycleState,
  type DraftMarkingSubmissionDTO,
} from "@/dto";

import { Transformers as T } from "@/db/transformers";
import { AllocationMethod, type MarkerType, PreferenceType } from "@/db/types";
import { type DB } from "@/db/types";

import { expand } from "@/lib/utils/general/instance-params";
import { sortPreferenceType } from "@/lib/utils/sorting/by-preference-type";
import { type ProjectPreferenceCardDto } from "@/lib/validations/board";
import { type InstanceParams } from "@/lib/validations/params";

import { Grade } from "../../logic/grading";
import { AllocationInstance } from "../space/instance";

import { User } from ".";

export class Student extends User {
  instance: AllocationInstance;

  constructor(db: DB, id: string, params: InstanceParams) {
    super(db, id);
    this.instance = new AllocationInstance(db, params);
  }

  public async get(): Promise<StudentDTO> {
    return await this.db.studentDetails
      .findFirstOrThrow({
        where: { userId: this.id, ...expand(this.instance.params) },
        include: {
          studentFlag: true,
          userInInstance: { include: { user: true } },
        },
      })
      .then((x) => T.toStudentDTO(x));
  }

  public async hasSelfDefinedProject(): Promise<boolean> {
    return !!(await this.db.project.findFirst({
      where: {
        preAllocatedStudentId: this.id,
        ...expand(this.instance.params),
      },
    }));
  }

  public async hasAllocation(): Promise<boolean> {
    return !!(await this.db.studentProjectAllocation.findFirst({
      where: { userId: this.id, ...expand(this.instance.params) },
    }));
  }

  public async getAllocation(): Promise<{
    project: ProjectDTO;
    supervisor: SupervisorDTO;
    studentRanking: number;
    rank: number;
    allocationMethod: AllocationMethod;
  }> {
    return await this.db.studentProjectAllocation
      .findFirstOrThrow({
        where: { userId: this.id, ...expand(this.instance.params) },
        include: {
          project: {
            include: {
              supervisor: {
                include: { userInInstance: { include: { user: true } } },
              },
              flagsOnProject: { include: { flag: true } },
              tagsOnProject: { include: { tag: true } },
            },
          },
        },
      })
      .then((x) => ({
        project: T.toProjectDTO(x.project),
        supervisor: T.toSupervisorDTO(x.project.supervisor),
        studentRanking: x.studentRanking,
        rank: x.studentRanking,
        allocationMethod: x.allocationMethod,
      }));
  }

  public async getLatestSubmissionDateTime(): Promise<Date | undefined> {
    const { latestSubmission } = await this.get();

    return latestSubmission;
  }

  public async getDraftPreference(
    projectId: string,
  ): Promise<PreferenceType | undefined> {
    return await this.db.studentDraftPreference
      .findFirst({
        where: { userId: this.id, projectId, ...expand(this.instance.params) },
        select: { type: true },
      })
      .then((x) => x?.type);
  }

  public async getAllDraftPreferences(): Promise<
    {
      project: ProjectDTO;
      score: number;
      type: PreferenceType;
      supervisor: SupervisorDTO;
    }[]
  > {
    const preferenceData = await this.db.studentDraftPreference.findMany({
      where: { userId: this.id, ...expand(this.instance.params) },
      select: {
        type: true,
        score: true,
        project: {
          include: {
            supervisor: {
              include: { userInInstance: { include: { user: true } } },
            },
            flagsOnProject: { include: { flag: true } },
            tagsOnProject: { include: { tag: true } },
          },
        },
      },
      orderBy: { score: "asc" },
    });

    return preferenceData
      .sort(sortPreferenceType)
      .map((x) => ({
        project: T.toProjectDTO(x.project),
        supervisor: T.toSupervisorDTO(x.project.supervisor),
        score: x.score,
        type: x.type,
      }));
  }

  public async getSubmittedPreferences(): Promise<
    { project: ProjectDTO; supervisor: SupervisorDTO; rank: number }[]
  > {
    return await this.db.studentDetails
      .findFirstOrThrow({
        where: { userId: this.id, ...expand(this.instance.params) },
        include: {
          submittedPreferences: {
            include: {
              project: {
                include: {
                  flagsOnProject: { include: { flag: true } },
                  tagsOnProject: { include: { tag: true } },
                  supervisor: {
                    include: { userInInstance: { include: { user: true } } },
                  },
                },
              },
            },
            orderBy: { rank: "asc" },
          },
        },
      })
      .then((data) =>
        data.submittedPreferences.map((x) => ({
          project: T.toProjectDTO(x.project),
          supervisor: T.toSupervisorDTO(x.project.supervisor),
          rank: x.rank,
        })),
      );
  }

  public async getPreferenceBoardState(): Promise<
    Record<PreferenceType, ProjectPreferenceCardDto[]>
  > {
    const res = await this.getAllDraftPreferences();

    const allProjects = res.map((e) => ({
      id: e.project.id,
      title: e.project.title,
      columnId: e.type,
      rank: e.score,
      supervisor: e.supervisor,
    }));

    const boardState: Record<PreferenceType, ProjectPreferenceCardDto[]> = {
      [PreferenceType.PREFERENCE]: allProjects.filter(
        (e) => e.columnId === PreferenceType.PREFERENCE,
      ),

      [PreferenceType.SHORTLIST]: allProjects.filter(
        (e) => e.columnId === PreferenceType.SHORTLIST,
      ),
    };

    return boardState;
  }

  public async setStudentFlag(flagId: string): Promise<StudentDTO> {
    const studentData = await this.db.studentDetails.update({
      where: {
        studentDetailsId: { userId: this.id, ...expand(this.instance.params) },
      },
      data: {
        studentFlag: {
          connect: { flagId: { ...expand(this.instance.params), id: flagId } },
        },
      },
      include: {
        studentFlag: true,
        userInInstance: { include: { user: true } },
      },
    });

    return T.toStudentDTO(studentData);
  }

  public async updateDraftPreferenceType(
    projectId: string,
    preferenceType: PreferenceType | undefined,
  ): Promise<void> {
    return await this.db.$transaction(async (tx) => {
      if (!preferenceType) {
        await tx.studentDraftPreference.delete({
          where: {
            draftPreferenceId: {
              userId: this.id,
              projectId,
              ...expand(this.instance.params),
            },
          },
        });
        return;
      }

      const preferences = await tx.studentDraftPreference.aggregate({
        where: {
          userId: this.id,
          type: preferenceType,
          ...expand(this.instance.params),
        },
        _max: { score: true },
      });

      const nextScore = (preferences._max?.score ?? 0) + 1;

      await tx.studentDraftPreference.upsert({
        where: {
          draftPreferenceId: {
            projectId,
            userId: this.id,
            ...expand(this.instance.params),
          },
        },
        create: {
          ...expand(this.instance.params),
          projectId,
          userId: this.id,
          type: preferenceType,
          score: nextScore,
        },
        update: { type: preferenceType, score: nextScore },
      });
    });
  }

  public async updateManyDraftPreferenceTypes(
    projectIds: string[],
    preferenceType: PreferenceType | undefined,
  ): Promise<void> {
    return await this.db.$transaction(async (tx) => {
      if (!preferenceType) {
        // user wants to remove all projects from their preferences
        await tx.studentDraftPreference.deleteMany({
          where: {
            userId: this.id,
            projectId: { in: projectIds },
            ...expand(this.instance.params),
          },
        });
        return;
      }

      // delete all existing preferences for these projects to avoid residuals
      await tx.studentDraftPreference.deleteMany({
        where: {
          userId: this.id,
          projectId: { in: projectIds },
          ...expand(this.instance.params),
        },
      });

      const preferences = await tx.studentDraftPreference.aggregate({
        where: {
          userId: this.id,
          type: preferenceType,
          ...expand(this.instance.params),
        },
        _max: { score: true },
      });

      const startingScore = (preferences._max?.score ?? 0) + 1;

      await tx.studentDraftPreference.createMany({
        data: projectIds.map((projectId, index) => ({
          projectId,
          userId: this.id,
          type: preferenceType,
          score: startingScore + index,
          ...expand(this.instance.params),
        })),
      });
    });
  }

  public async updateDraftPreferenceRank(
    projectId: string,
    updatedRank: number,
    preferenceType: PreferenceType,
  ): Promise<{ project: ProjectDTO; rank: number }> {
    const preferenceData = await this.db.studentDraftPreference.update({
      where: {
        draftPreferenceId: {
          projectId,
          userId: this.id,
          ...expand(this.instance.params),
        },
      },
      data: { type: preferenceType, score: updatedRank },
      include: {
        project: {
          include: {
            flagsOnProject: { include: { flag: true } },
            tagsOnProject: { include: { tag: true } },
            supervisor: {
              include: { userInInstance: { include: { user: true } } },
            },
          },
        },
      },
    });

    return {
      project: T.toProjectDTO(preferenceData.project),
      rank: updatedRank,
    };
  }

  // ? maybe make non-interactive
  public async submitPreferences(): Promise<Date> {
    const newSubmissionDateTime = new Date();

    await this.db.$transaction(async (tx) => {
      const preferences = await tx.studentDraftPreference.findMany({
        where: {
          userId: this.id,
          type: PreferenceType.PREFERENCE,
          ...expand(this.instance.params),
        },
        select: { projectId: true, score: true },
        orderBy: { score: "asc" },
      });

      await tx.studentSubmittedPreference.deleteMany({
        where: { userId: this.id, ...expand(this.instance.params) },
      });

      await tx.studentSubmittedPreference.createMany({
        data: preferences.map(({ projectId }, i) => ({
          projectId,
          rank: i + 1,
          userId: this.id,
          ...expand(this.instance.params),
        })),
      });

      await tx.studentDetails.update({
        where: {
          studentDetailsId: {
            userId: this.id,
            ...expand(this.instance.params),
          },
        },
        data: { latestSubmissionDateTime: newSubmissionDateTime },
      });
    });

    return newSubmissionDateTime;
  }

  public async allocateRandomProject(projectId: string): Promise<void> {
    await this.db.studentProjectAllocation.upsert({
      where: {
        studentProjectAllocationId: {
          ...expand(this.instance.params),
          userId: this.id,
        },
      },
      create: {
        ...expand(this.instance.params),
        projectId,
        userId: this.id,
        studentRanking: 1,
        allocationMethod: AllocationMethod.RANDOM,
      },
      update: {
        projectId,
        studentRanking: 1,
        allocationMethod: AllocationMethod.RANDOM,
      },
    });
  }

  public async getReader(): Promise<ReaderDTO> {
    const data = await this.db.readerDetails.findFirstOrThrow({
      where: {
        projectAllocations: {
          some: {
            project: { studentAllocations: { some: { userId: this.id } } },
          },
        },
      },
      include: { userInInstance: { include: { user: true } } },
    });

    return T.toReaderDTO(data);
  }

  public async getSupervisor(): Promise<SupervisorDTO> {
    const data = await this.db.supervisorDetails.findFirstOrThrow({
      where: {
        projects: {
          some: {
            studentAllocations: { some: { student: { userId: this.id } } },
          },
        },
      },
      include: { userInInstance: { include: { user: true } } },
    });

    return T.toSupervisorDTO(data);
  }

  public async getMarkingData(
    markerType?: MarkerType,
  ): Promise<
    {
      unit: UnitOfAssessmentDTO;
      grade?: UnitGradeDTO;
      status: UnitGradingLifecycleState;
    }[]
  > {
    const data = await this.db.studentDetails.findFirstOrThrow({
      where: { ...expand(this.instance.params), userId: this.id },
      include: {
        unitGrades: true,
        unitSubmissions: true,
        studentFlag: {
          include: {
            unitsOfAssessment: {
              include: { flag: true, markingComponents: true },
              where: markerType && { allowedMarkerTypes: { has: markerType } },
            },
          },
        },
      },
    });

    type UnitId = string;

    const gradesDict: Record<UnitId, UnitGradeDTO> = data.unitGrades.reduce(
      (acc, val) => ({
        ...acc,
        [val.unitOfAssessmentId]: T.toUnitGradeDTO(val),
      }),
      {},
    );

    const submissionsDict: Record<UnitId, FullMarkingSubmissionDTO[]> =
      data.unitSubmissions.reduce(
        (acc, val) => {
          const old = acc[val.unitOfAssessmentId] ?? [];

          return {
            ...acc,
            [val.unitOfAssessmentId]: [...old, T.toMarkingSubmissionDTO(val)],
          };
        },
        {} as Record<UnitId, FullMarkingSubmissionDTO[]>,
      );

    return data.studentFlag.unitsOfAssessment.map((data) => {
      const unit = T.toUnitOfAssessmentDTO(data);
      const grade = gradesDict[data.id];
      const submissions = submissionsDict[data.id] ?? [];

      const status = Grade.getUnitStatus(unit, grade, submissions);

      return { unit, grade, status };
    });
  }

  async getMarkerIds(): Promise<{ readerId: string; supervisorId: string }> {
    const spa = await this.db.studentProjectAllocation.findFirstOrThrow({
      where: { ...expand(this.instance.params), student: { userId: this.id } },
      select: {
        project: {
          select: {
            supervisorId: true,
            readerAllocations: { select: { readerId: true } },
          },
        },
      },
    });

    const supervisorId = spa.project.supervisorId;
    const readerId = spa.project.readerAllocations[0].readerId;

    return { supervisorId, readerId };
  }

  public async getMarkerMarksByUnitId({
    markerId,
    unitId,
  }: {
    markerId: string;
    unitId: string;
  }): Promise<
    FullMarkingSubmissionDTO | DraftMarkingSubmissionDTO | undefined
  > {
    const data = await this.db.unitOfAssessmentSubmission.findUnique({
      where: {
        uoaSubmissionId: {
          markerId,
          studentId: this.id,
          unitOfAssessmentId: unitId,
        },
      },
      include: { criterionScores: true },
    });

    if (!data) return undefined;

    return T.toMarkingSubmissionDTO(data);
  }

  public async unitConsensus({
    unitId,
  }: {
    unitId: string;
  }): Promise<UnitGradeDTO> {
    const grade = await this.db.unitOfAssessmentGrade.findUniqueOrThrow({
      where: { uoaGradeId: { studentId: this.id, unitOfAssessmentId: unitId } },
    });

    // if (grade === null) return undefined;
    return T.toUnitGradeDTO(grade);
  }
}
