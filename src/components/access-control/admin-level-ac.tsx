"use client";

import { type ReactNode } from "react";

import { useParams } from "next/navigation";

import { AdminLevel, adminLevelOrd } from "@/db/types";

import { api } from "@/lib/trpc/client";
import { type RefinedSpaceParams } from "@/lib/validations/params";

export function AdminLevelAC({
  children,
  minimumAdminLevel = AdminLevel.SUB_GROUP,
}: {
  children: ReactNode;
  minimumAdminLevel?: AdminLevel;
}) {
  const params = useParams<RefinedSpaceParams>();
  const { data, status } = api.ac.getAdminLevelInSpace.useQuery({ params });

  if (status !== "success") return <></>;
  if (adminLevelOrd[data] >= adminLevelOrd[minimumAdminLevel])
    return <>{children}</>;

  return <></>;
}
