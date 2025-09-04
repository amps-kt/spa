import { type ReactNode } from "react";

import { Role, Stage } from "@/db/types";

import { Unauthorised } from "@/components/unauthorised";

import { api } from "@/lib/trpc/server";
import { stageLt } from "@/lib/utils/permissions/stage-check";
import { type InstanceParams } from "@/lib/validations/params";

export default async function Layout({
  params,
  children,
}: {
  params: InstanceParams;
  children: ReactNode;
}) {
  const roles = await api.user.roles({ params });
  const stage = await api.institution.instance.getCurrentStage({ params });

  if (!roles.has(Role.STUDENT)) {
    return (
      <Unauthorised message="You need to be a Student to access this page" />
    );
  }

  if (stageLt(stage, Stage.STUDENT_BIDDING)) {
    return (
      <Unauthorised message="You are not allowed to access the platform at this time" />
    );
  }

  return <section className="mr-12 w-full">{children}</section>;
}
