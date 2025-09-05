"use client";

import { useMemo } from "react";

import { api } from "@/lib/trpc/client";

import { useInstanceParams } from "../params-context";

import { checkAC } from "./check-ac";
import {
  type AccessCondition,
  type AccessControlState,
  AccessControlResult,
} from "./types";

export function useAccessControl(
  conditions: AccessCondition = {},
): AccessControlState {
  const params = useInstanceParams();

  const { data: userRolesSet, isSuccess: rolesLoaded } =
    api.user.roles.useQuery({ params });
  const { data: currentStage, isSuccess: stageLoaded } =
    api.institution.instance.getCurrentStage.useQuery({ params });

  const isLoading = !rolesLoaded || !stageLoaded;

  return useMemo(() => {
    if (isLoading) {
      return { status: AccessControlResult.LOADING };
    } else if (!userRolesSet || !currentStage) {
      return { status: AccessControlResult.ERROR };
    }

    return checkAC(
      { userRoles: Array.from(userRolesSet), currentStage },
      conditions,
    );
  }, [isLoading, userRolesSet, currentStage, conditions]);
}
