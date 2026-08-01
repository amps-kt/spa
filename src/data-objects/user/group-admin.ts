import { type DataAccessScope } from "@/db/scope";

import { type GroupParams } from "@/lib/validations/params";

import { AllocationGroup } from "../space/group";

import { User } from ".";

export class GroupAdmin extends User {
  allocationGroup: AllocationGroup;

  constructor(sc: DataAccessScope, id: string, groupParams: GroupParams) {
    super(sc, id);
    this.allocationGroup = new AllocationGroup(sc, groupParams);
  }
}
