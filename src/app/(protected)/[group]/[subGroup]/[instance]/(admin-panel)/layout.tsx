import { type ReactNode } from "react";

import { api } from "@/lib/trpc/server";
import { forbidden } from "@/lib/utils/redirect";
import { type InstanceParams } from "@/lib/validations/params";

export default async function Layout({
  params,
  children,
}: {
  params: InstanceParams;
  children: ReactNode;
}) {
  const access = await api.ac.isAdminInInstance({ params });
  if (!access) forbidden({ params });

  return <>{children}</>;
}
