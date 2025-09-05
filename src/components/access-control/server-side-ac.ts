import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

import { checkAC } from "./check-ac";
import type { AccessCondition, AccessControlState } from "./types";

export async function serverSideAC(
  conditions: AccessCondition = {},
  params: InstanceParams,
): Promise<AccessControlState> {
  const userRolesSet = await api.user.roles({ params });
  const currentStage = await api.institution.instance.getCurrentStage({
    params,
  });

  return checkAC(
    { userRoles: Array.from(userRolesSet), currentStage },
    conditions,
  );
}
