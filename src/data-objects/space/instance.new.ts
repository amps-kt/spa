import { type Scope, ScopedDataObject } from "@/server/scope";

import { expand } from "@/lib/utils/instance-params";
import { type InstanceParams } from "@/lib/validations/params";

import { Project } from "../project";

export class AllocationInstance extends ScopedDataObject {
  public params: InstanceParams;

  constructor(scope: Scope, params: InstanceParams) {
    super(scope);
    this.params = params;
  }

  public withScope(sc: Scope): AllocationInstance {
    return new AllocationInstance(sc, this.params);
  }

  public async createProject(data: {
    title: string;
    description: string;
    capacityUpperBound: number;
    preAllocatedStudentId: string | undefined;
    supervisorId: string;
  }) {
    const created = await this.sc.db.project.create({
      data: {
        ...expand(this.params),
        title: data.title,
        description: data.description,
        capacityLowerBound: 0,
        capacityUpperBound: data.capacityUpperBound,
        preAllocatedStudentId: data.preAllocatedStudentId ?? null,
        latestEditDateTime: new Date(),
        supervisorId: data.supervisorId,
      },
    });

    return new Project(this.sc, { ...this.params, projectId: created.id });
  }
}
