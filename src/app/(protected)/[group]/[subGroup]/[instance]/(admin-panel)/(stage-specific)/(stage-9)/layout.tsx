import { redirect } from "next/navigation";

import { Stage } from "@/db/types";

import { api } from "@/lib/trpc/server";
import { formatParamsAsPath } from "@/lib/utils/general/get-instance-path";
import { type InstanceParams } from "@/lib/validations/params";

export default async function Layout({
  params,
  children,
}: {
  params: InstanceParams;
  children: React.ReactNode;
}) {
  const stage = await api.institution.instance.getCurrentStage({ params });
  const instancePath = formatParamsAsPath(params);

  if (stage !== Stage.MARK_SUBMISSION) redirect(`${instancePath}/`);

  return <>{children}</>;
}
