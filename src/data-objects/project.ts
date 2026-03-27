import {
  type ProjectDTO,
  type FlagDTO,
  type StudentDTO,
  type SupervisorDTO,
} from "@/dto";

import { Transformers as T } from "@/db/transformers";
import { AllocationMethod, type DB } from "@/db/types";

import { type DataAccessScope, ScopedDataObject } from "@/server/scope";

import { expand, toPP2 } from "@/lib/utils/instance-params";
import {
  type InstanceParams,
  type ProjectParams,
} from "@/lib/validations/params";

import { AllocationGroup } from "./space/group";
import { AllocationInstance } from "./space/instance";
import { AllocationSubGroup } from "./space/sub-group";

export class Project extends ScopedDataObject {
  public params: ProjectParams;
  private _group: AllocationGroup | undefined;
  private _subgroup: AllocationSubGroup | undefined;
  private _instance: AllocationInstance | undefined;

  constructor(sc: DataAccessScope, params: ProjectParams) {
    super(sc);
    this.params = params;
  }

  // --- Reads ----------------

  public async exists() {
    return !!(await this.sc.db.project.findFirst({
      where: toPP2(this.params),
    }));
  }

  public async get(): Promise<ProjectDTO> {
    return await this.sc.db.project
      .findFirstOrThrow({
        where: toPP2(this.params),
        include: {
          flagsOnProject: { include: { flag: true } },
          tagsOnProject: { include: { tag: true } },
        },
      })
      .then((x) => T.toProjectDTO(x));
  }

  public async getSupervisor(): Promise<SupervisorDTO> {
    const { supervisorId } = await this.get();

    const data = await this.sc.db.supervisorDetails.findUniqueOrThrow({
      where: {
        supervisorDetailsId: { ...expand(this.params), userId: supervisorId },
      },
      include: { userInInstance: { include: { user: true } } },
    });

    return T.toSupervisorDTO(data);
  }

  public async getFlags(): Promise<FlagDTO[]> {
    const data = await this.sc.db.project.findFirstOrThrow({
      where: toPP2(this.params),
      include: { flagsOnProject: { include: { flag: true } } },
    });

    return data.flagsOnProject.map((f) => T.toFlagDTO(f.flag));
  }

  public async getAllSubmittedPreferences(): Promise<
    { student: StudentDTO; rank: number }[]
  > {
    const data = await this.sc.db.studentSubmittedPreference.findMany({
      where: { ...expand(this.params), projectId: this.params.projectId },
      include: {
        student: {
          include: {
            userInInstance: { include: { user: true } },
            studentFlag: true,
          },
        },
      },
    });

    return data.map(({ rank, student }) => ({
      student: T.toStudentDTO(student),
      rank,
    }));
  }

  public async getAllocation(): Promise<
    { student: StudentDTO; rank: number; isPreAllocated: boolean } | undefined
  > {
    const data = await this.sc.db.studentProjectAllocation.findFirst({
      where: { projectId: this.params.projectId },
      include: {
        student: {
          include: {
            userInInstance: { include: { user: true } },
            studentFlag: true,
          },
        },
      },
    });

    if (!data) return undefined;

    return {
      student: T.toStudentDTO(data.student),
      rank: data.studentRanking,
      isPreAllocated: data.allocationMethod === AllocationMethod.PRE_ALLOCATED,
    };
  }

  public async hasPreAllocatedStudent(): Promise<boolean> {
    const project = await this.get();
    return !!project.preAllocatedStudentId;
  }

  public async getPreAllocatedStudent(): Promise<StudentDTO> {
    const { preAllocatedStudentId } = await this.get();
    if (!preAllocatedStudentId) {
      throw new Error("This project has no pre-allocated student");
    }

    const project = await this.sc.db.project.findFirstOrThrow({
      where: {
        id: this.params.projectId,
        preAllocatedStudent: { isNot: null },
      },
      include: {
        preAllocatedStudent: {
          include: {
            userInInstance: { include: { user: true } },
            studentFlag: true,
          },
        },
      },
    });

    if (!project.preAllocatedStudent) {
      throw new Error("This project has no pre-allocated student");
    }

    return T.toStudentDTO(project.preAllocatedStudent);
  }

  // --- Child data objects (now share scope) ----------------------------------

  get group() {
    // TODO: once AllocationGroup is migrated to ScopedDataObject,
    // change to: new AllocationGroup(this.scope, this.params)
    this._group ??= new AllocationGroup(this.sc.db as DB, this.params);
    return this._group;
  }

  get subGroup() {
    this._subgroup ??= new AllocationSubGroup(this.sc.db as DB, this.params);
    return this._subgroup;
  }

  get instance() {
    this._instance ??= new AllocationInstance(this.sc.db as DB, this.params);
    return this._instance;
  }

  // --- Writes ----------------------------------------------------------------

  public static async create(
    sc: DataAccessScope,
    params: InstanceParams,
    data: {
      title: string;
      description: string;
      capacityUpperBound: number;
      preAllocatedStudentId?: string | null;
      supervisorId: string;
    },
  ): Promise<Project> {
    const created = await sc.db.project.create({
      data: {
        ...expand(params),
        title: data.title,
        description: data.description,
        capacityLowerBound: 0,
        capacityUpperBound: data.capacityUpperBound,
        preAllocatedStudentId: data.preAllocatedStudentId ?? null,
        latestEditDateTime: new Date(),
        supervisorId: data.supervisorId,
      },
    });

    return new Project(sc, { ...params, projectId: created.id });
  }

  public async update(data: {
    title: string;
    description: string;
    capacityUpperBound: number;
    supervisorId: string;
    preAllocatedStudentId?: string | null;
  }): Promise<void> {
    await this.sc.db.project.update({
      where: toPP2(this.params),
      data: {
        title: data.title,
        description: data.description,
        capacityUpperBound: data.capacityUpperBound,
        supervisorId: data.supervisorId,
        preAllocatedStudentId: data.preAllocatedStudentId ?? null,
        latestEditDateTime: new Date(),
      },
    });
  }

  public async transferSupervisor(newSupervisorId: string): Promise<void> {
    await this.sc.db.project.update({
      where: toPP2(this.params),
      data: { supervisorId: newSupervisorId },
    });
  }

  public async delete(): Promise<void> {
    await this.sc.db.project.delete({ where: toPP2(this.params) });
  }

  // Can now absorbed the dreaded @/db/transactions/*
  // These used to be standalone functions that took a TX parameter.
  // Now they can be methods that use this.sc.db, so they can
  //  automatically participate in whatever transaction the scope is in.

  /** Idempotent add flags */
  public async addFlags(flags: FlagDTO[]): Promise<void> {
    await this.sc.db.flagOnProject.createMany({
      data: flags.map((flag) => ({
        projectId: this.params.projectId,
        flagId: flag.id,
        ...expand(this.params),
      })),
      skipDuplicates: true,
    });
  }

  /** Sync flags: removes flags not in the list, adds missing ones. */
  public async linkFlags(flagIds: string[]): Promise<void> {
    await this.sc.batch([
      this.sc.db.flagOnProject.deleteMany({
        where: { projectId: this.params.projectId, flagId: { notIn: flagIds } },
      }),

      this.sc.db.flagOnProject.createMany({
        data: flagIds.map((id) => ({
          ...expand(this.params),
          projectId: this.params.projectId,
          flagId: id,
        })),
        skipDuplicates: true,
      }),
    ]);
  }

  /** Sync tags: removes tags not in the list, adds missing ones. */
  public async linkTags(tagIds: string[]): Promise<void> {
    await this.sc.batch([
      this.db.tagOnProject.deleteMany({
        where: { projectId: this.params.projectId, tagId: { notIn: tagIds } },
      }),
      this.sc.db.tagOnProject.createMany({
        data: tagIds.map((id) => ({
          projectId: this.params.projectId,
          tagId: id,
        })),
        skipDuplicates: true,
      }),
    ]);
  }

  /** Set the pre-allocated student and create the allocation record. */
  public async linkPreAllocatedStudent(userId: string): Promise<void> {
    await this.sc.batch([
      this.sc.db.studentProjectAllocation.deleteMany({
        where: { ...expand(this.params), projectId: this.params.projectId },
      }),
      this.sc.db.studentProjectAllocation.create({
        data: {
          ...expand(this.params),
          projectId: this.params.projectId,
          userId,
          studentRanking: 1,
          allocationMethod: AllocationMethod.PRE_ALLOCATED,
        },
      }),
    ]);
  }

  /** Clear the pre-allocated student reference on the project. */
  public async clearPreAllocation(): Promise<void> {
    await this.sc.db.project.update({
      where: toPP2(this.params),
      data: { preAllocatedStudentId: null },
    });
  }
}
