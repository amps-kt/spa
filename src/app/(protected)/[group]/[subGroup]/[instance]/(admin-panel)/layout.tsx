import { type ReactNode } from "react";

import { forbidden } from "@/lib/routing";
import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

export default async function Layout({
  children,
  ...props
}: {
  params: Promise<InstanceParams>;
  children: ReactNode;
}) {
  const params = await props.params;

  const access = await api.ac.isAdminInInstance({ params });
  if (!access) forbidden({ params });

  return <>{children}</>;
}
