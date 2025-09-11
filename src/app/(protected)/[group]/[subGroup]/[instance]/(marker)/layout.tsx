import { type ReactNode } from "react";

import { Role } from "@/db/types";

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
  const roles = await api.user.roles({ params });
  if (!roles.has(Role.SUPERVISOR) && !roles.has(Role.READER))
    forbidden({ params });

  return <section className="mr-12 w-full">{children}</section>;
}
