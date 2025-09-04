import {
  type ProjectDTO,
  type FlagDTO,
  type StudentDTO,
  type SupervisorDTO,
} from "@/dto";

import { Transformers as T } from "@/db/transformers";
import { type DB } from "@/db/types";

import { expand, toPP2 } from "@/lib/utils/general/instance-params";
import { type ProjectParams } from "@/lib/validations/params";

import { AllocationGroup } from "./space/group";
import { AllocationInstance } from "./space/instance";
import { AllocationSubGroup } from "./space/sub-group";

import { DataObject } from "./data-object";

export class Project extends DataObject {
  public params: ProjectParams;
  private _group: AllocationGroup | undefined;
  private _subgroup: AllocationSubGroup | undefined;
  private _instance: AllocationInstance | undefined;

  constructor(db: DB, params: ProjectParams) {
    super(db);
    this.params = params;
  }

  public async exists() {
    return !!(await this.db.project.findFirst({ where: toPP2(this.params) }));
  }

  public async get(): Promise<ProjectDTO> {
    return await this.db.project
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

    const data = await this.db.supervisorDetails.findUniqueOrThrow({
      where: {
        supervisorDetailsId: { ...expand(this.params), userId: supervisorId },
      },
      include: { userInInstance: { include: { user: true } } },
    });

    return T.toSupervisorDTO(data);
  }

  get group() {
    this._group ??= new AllocationGroup(this.db, this.params);
    return this._group;
  }

  get subGroup() {
    this._subgroup ??= new AllocationSubGroup(this.db, this.params);
    return this._subgroup;
  }

  get instance() {
    this._instance ??= new AllocationInstance(this.db, this.params);
    return this._instance;
  }

  public async getFlags(): Promise<FlagDTO[]> {
    const data = await this.db.project.findFirstOrThrow({
      where: toPP2(this.params),
      include: { flagsOnProject: { include: { flag: true } } },
    });

    return data.flagsOnProject.map((f) => T.toFlagDTO(f.flag));
  }

  public async transferSupervisor(newSupervisorId: string): Promise<void> {
    await this.db.project.update({
      where: toPP2(this.params),
      data: { supervisorId: newSupervisorId },
    });
  }

  public async addFlags(flags: FlagDTO[]): Promise<void> {
    await this.db.flagOnProject.createMany({
      data: flags.map((flag) => ({
        projectId: this.params.projectId,
        flagId: flag.id,
        ...expand(this.instance.params),
      })),
      skipDuplicates: true,
    });
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

    const project = await this.db.project.findFirstOrThrow({
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

  public async clearPreAllocation(): Promise<void> {
    await this.db.project.update({
      where: toPP2(this.params),
      data: { preAllocatedStudentId: null },
    });
  }

  public async delete(): Promise<void> {
    await this.db.project.delete({ where: toPP2(this.params) });
  }
}
