import { Stage } from "@/db/types";

import { redirect } from "@/lib/routing";
import { api } from "@/lib/trpc/server";
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

  if (stage !== Stage.GRADE_PUBLICATION) redirect("instance", params);

  return <>{children}</>;
}
