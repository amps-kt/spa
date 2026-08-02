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

export async function generateMetadata(props: {
  params: Promise<InstanceParams>;
}) {
  const params = await props.params;
  const { displayName } = await api.institution.instance.get({ params });

  return { title: metadataTitle([displayName, app.name]) };
}

export default async function Page(props: { params: Promise<InstanceParams> }) {
  const params = await props.params;
  const { displayName } = await api.institution.instance.get({ params });

  const isJoined = await api.user.isJoined({ params });
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
      <JoinInstance isJoined={isJoined} />
    </PanelWrapper>
  );
}
