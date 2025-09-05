import type { Stage } from "@prisma/client";

import type { Role } from "@/db/types";

import { hasOverlap } from "@/lib/utils/general/set-intersection";

import {
  type ACOverrides,
  type CustomCondition,
  type AccessControlContext,
  type AccessCondition,
  AccessControlResult,
  DenialReason,
  type AccessControlState,
} from "./types";

function checkRoles(
  userRoles: Role[],
  allowedRoles?: Role[],
  { AND = true, OR = false }: ACOverrides = {},
): boolean {
  if (!allowedRoles || allowedRoles.length == 0) return true;
  else return OR || (AND && hasOverlap(allowedRoles, userRoles, (x) => x));
}

function checkStage(
  currentStage: Stage,
  allowedStages?: Stage[],
  { AND = true, OR = false }: ACOverrides = {},
): boolean {
  if (!allowedStages || allowedStages.length == 0) return true;
  else return OR || (AND && allowedStages.includes(currentStage));
}

function checkCondition(
  userRoles: Role[],
  currentStage: Stage,
  customCondition?: CustomCondition,
): boolean {
  if (!customCondition) return true;
  else return customCondition({ userRoles, currentStage });
}

export function checkAC(
  { userRoles, currentStage }: AccessControlContext,
  condition: AccessCondition,
) {
  const { allowedRoles, allowedStages, customCondition, overrides } = condition;

  const hasRequiredRole = checkRoles(userRoles, allowedRoles, overrides?.roles);
  const hasRequiredStage = checkStage(
    currentStage,
    allowedStages,
    overrides?.stage,
  );
  const passesCustomCondition = checkCondition(
    userRoles,
    currentStage,
    customCondition,
  );

  if (hasRequiredRole && hasRequiredStage && passesCustomCondition) {
    return {
      status: AccessControlResult.ALLOWED,
      ctx: { userRoles, currentStage },
    };
  } else {
    const reasons: DenialReason[] = [];

    if (!hasRequiredRole && allowedRoles) {
      reasons.push({ code: DenialReason.BAD_ROLE, allowedRoles });
    }
    if (!hasRequiredStage && allowedStages) {
      reasons.push({ code: DenialReason.BAD_STAGE, allowedStages });
    }
    if (!passesCustomCondition) {
      reasons.push({ code: DenialReason.BAD_CUSTOM });
    }

    return {
      status: AccessControlResult.DENIED,
      ctx: { userRoles, currentStage },
      reasons,
    } satisfies AccessControlState;
  }
}
