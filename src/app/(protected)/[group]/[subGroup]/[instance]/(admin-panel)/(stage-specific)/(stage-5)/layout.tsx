import { Stage } from "@/db/types";

import { redirect } from "@/lib/routing";
import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

export default async function Layout({
  params,
  children,
}: {
  params: InstanceParams;
  children: React.ReactNode;
}) {
  const stage = await api.institution.instance.getCurrentStage({ params });

  if (stage !== Stage.ALLOCATION_ADJUSTMENT) redirect("instance", params);

  return <>{children}</>;
}
