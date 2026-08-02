import { Stage } from "@/db/types";

import { redirect } from "@/lib/routing";
import { api } from "@/lib/trpc/server";
import { stageLt } from "@/lib/utils/permissions/stage-check";
import { type InstanceParams } from "@/lib/validations/params";

export default async function Layout({
  children,
  ...props
}: {
  params: Promise<InstanceParams>;
  children: React.ReactNode;
}) {
  const params = await props.params;

  const stage = await api.institution.instance.getCurrentStage({ params });

  if (stageLt(stage, Stage.PROJECT_SUBMISSION)) redirect("instance", params);

  return <>{children}</>;
}
