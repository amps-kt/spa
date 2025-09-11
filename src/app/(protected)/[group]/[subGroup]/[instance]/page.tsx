import { app, metadataTitle } from "@/config/meta";

import { Role } from "@/db/types";

import { Heading } from "@/components/heading";
import { JoinInstance } from "@/components/join-instance";
import { PanelWrapper } from "@/components/panel-wrapper";
import { Separator } from "@/components/ui/separator";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

import {
  AdminHome,
  ReaderHome,
  StudentHome,
  SupervisorHome,
} from "./_components/instance-home";

export async function generateMetadata({ params }: { params: InstanceParams }) {
  const { displayName } = await api.institution.instance.get({ params });

  return { title: metadataTitle([displayName, app.name]) };
}

export default async function Page({ params }: { params: InstanceParams }) {
  const { displayName } = await api.institution.instance.get({ params });

  const roles = await api.user.roles({ params });
  const hasMultipleRoles = roles.size > 1;

  return (
    <PanelWrapper>
      <Heading>{displayName}</Heading>
      {roles.has(Role.ADMIN) && (
        <>
          <AdminHome params={params} hasMultipleRoles={hasMultipleRoles} />
          {(roles.has(Role.SUPERVISOR) || roles.has(Role.READER)) && (
            <Separator className="my-10" />
          )}
        </>
      )}
      {roles.has(Role.SUPERVISOR) && (
        <>
          <SupervisorHome params={params} hasMultipleRoles={hasMultipleRoles} />
          {roles.has(Role.READER) && <Separator className="my-10" />}
        </>
      )}
      {roles.has(Role.READER) && (
        <ReaderHome params={params} hasMultipleRoles={hasMultipleRoles} />
      )}
      {roles.has(Role.STUDENT) && <StudentHome params={params} />}
      <JoinInstance />
    </PanelWrapper>
  );
}
