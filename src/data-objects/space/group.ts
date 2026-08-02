import {
  type SubGroupDTO,
  type GroupDTO,
  type UserDTO,
  type InstanceDTO,
  type ProjectDTO,
  type SupervisorDTO,
} from "@/dto";

import { type DataAccessScope, ScopedDataObject } from "@/db/scope";
import { Transformers as T } from "@/db/transformers";

import { uniqueById } from "@/lib/utils/list-unique";
import { type GroupParams } from "@/lib/validations/params";

import { User } from "../user";

import { Institution } from "./institution";

export class AllocationGroup extends ScopedDataObject {
  public params: GroupParams;
  private _institution: Institution | undefined;

  constructor(sc: DataAccessScope, params: GroupParams) {
    super(sc);
    this.params = params;
  }

  public async linkAdmin(userId: string): Promise<void> {
    await this.db.groupAdmin.create({
      data: { userId, allocationGroupId: this.params.group },
    });
  }

  public async unlinkAdmin(userId: string): Promise<void> {
    await this.db.groupAdmin.delete({
      where: { groupAdminId: { userId, allocationGroupId: this.params.group } },
    });
  }

  public async createSubGroup(displayName: string): Promise<SubGroupDTO> {
    // WARNING BUG
    // imagine the following:
    // create SG hello
    // rename hello -> goodbye
    // create SG hello
    // This will fail!
    // IT SHOULD NOT!
    // problem: slug & id are the same thing
    // this issue likely persists across all spaces
    // (I haven't checked)
    return await this.db.allocationSubGroup
      .create({
        data: {
          id: encodeURIComponent(displayName),
          displayName,
          allocationGroupId: this.params.group,
        },
      })
      .then(T.toAllocationSubGroupDTO);
  }

  public async exists(): Promise<boolean> {
    return !!(await this.db.allocationGroup.findUnique({
      where: { id: this.params.group },
    }));
  }

  public async get(): Promise<GroupDTO> {
    return await this.db.allocationGroup
      .findFirstOrThrow({ where: { id: this.params.group } })
      .then(T.toAllocationGroupDTO);
  }

  public async getSubGroups(): Promise<SubGroupDTO[]> {
    const subgroups = await this.db.allocationSubGroup.findMany({
      where: { allocationGroupId: this.params.group },
    });

    return subgroups.map(T.toAllocationSubGroupDTO);
  }

  public async getAdmins(): Promise<UserDTO[]> {
    const admins = await this.db.groupAdmin.findMany({
      where: { allocationGroupId: this.params.group },
      select: { user: true },
    });

    return admins.map(({ user }) => user);
  }

  public async getManagers(): Promise<UserDTO[]> {
    const groupAdmins = await this.getAdmins();
    const superAdmins = await this.institution.getAdmins();

    return uniqueById([...groupAdmins, ...superAdmins]);
  }

  public async isGroupAdmin(userId: string): Promise<boolean> {
    const user = new User(this.sc, userId);
    return await user.isGroupAdmin(this.params);
  }

  public async delete(): Promise<GroupDTO> {
    return await this.db.allocationGroup
      .delete({ where: { id: this.params.group } })
      .then(T.toAllocationGroupDTO);
  }

  get institution() {
    this._institution ??= new Institution(this.sc);
    return this._institution;
  }

  public async getAllProjects(): Promise<
    {
      project: ProjectDTO;
      supervisor: SupervisorDTO;
      instanceData: InstanceDTO;
    }[]
  > {
    const projectData = await this.db.project.findMany({
      where: { allocationGroupId: this.params.group },
      include: {
        allocationInstance: true,
        tagsOnProject: { include: { tag: true } },
        flagsOnProject: { include: { flag: true } },
        supervisor: {
          include: { userInInstance: { include: { user: true } } },
        },
      },
    });

    return projectData.map((x) => ({
      instanceData: T.toAllocationInstanceDTO(x.allocationInstance),
      project: T.toProjectDTO(x),
      supervisor: T.toSupervisorDTO(x.supervisor),
    }));
  }
}
