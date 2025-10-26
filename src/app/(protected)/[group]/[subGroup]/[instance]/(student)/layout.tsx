import { type ReactNode } from "react";

import { Role, Stage } from "@/db/types";

import { api } from "@/lib/trpc/server";
import { stageLt } from "@/lib/utils/permissions/stage-check";
import { forbidden, unauthorised } from "@/lib/utils/redirect";
import { type InstanceParams } from "@/lib/validations/params";

export default async function Layout({
  params,
  children,
}: {
  params: InstanceParams;
  children: ReactNode;
}) {
  // replace with user.isStudentInInstance
  const roles = await api.user.roles({ params });
  if (!roles.has(Role.STUDENT)) forbidden({ params });

  // potentially replace with instance.getStudentAccess - once stages get killed
  const stage = await api.institution.instance.getCurrentStage({ params });
  if (stageLt(stage, Stage.STUDENT_BIDDING)) unauthorised({ params });

  return <section className="mr-12 w-full">{children}</section>;
}
