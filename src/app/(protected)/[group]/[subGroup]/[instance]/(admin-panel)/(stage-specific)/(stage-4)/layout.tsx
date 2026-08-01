import { Stage } from "@/db/types";

import { redirect } from "@/lib/routing";
import { api } from "@/lib/trpc/server";
import { stageLt } from "@/lib/utils/permissions/stage-check";
import { type InstanceParams } from "@/lib/validations/params";

export default async function Layout({
  params,
  children,
}: {
  params: InstanceParams;
  children: React.ReactNode;
}) {
  const stage = await api.institution.instance.getCurrentStage({ params });

  if (stageLt(stage, Stage.PROJECT_ALLOCATION)) redirect("instance", params);

  return <>{children}</>;
}
