import { type ReactNode } from "react";

import { Stage } from "@/db/types";

import { forbidden } from "@/lib/routing";
import { api } from "@/lib/trpc/server";
import { stageLt } from "@/lib/utils/permissions/stage-check";
import { type InstanceParams } from "@/lib/validations/params";

export default async function Layout({
  children,
  ...props
}: {
  params: Promise<InstanceParams>;
  children: ReactNode;
}) {
  const params = await props.params;
  const { stage } = await api.institution.instance.get({ params });

  if (stageLt(stage, Stage.MARK_SUBMISSION)) forbidden({ params });

  return <>{children}</>;
}
