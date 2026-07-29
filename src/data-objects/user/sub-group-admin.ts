
import { type SubGroupParams } from "@/lib/validations/params";

import { AllocationSubGroup } from "../space/sub-group";

import { User } from ".";
import { type DataAccessScope } from "@/db/scope";

export class SubGroupAdmin extends User {
  subGroup: AllocationSubGroup;

  constructor(sc: DataAccessScope, id: string, subGroupParams: SubGroupParams) {
    super(sc, id);
    this.subGroup = new AllocationSubGroup(sc, subGroupParams);
  }
}
