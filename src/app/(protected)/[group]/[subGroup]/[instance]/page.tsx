import { app, metadataTitle } from "@/config/meta";

import { Role } from "@/db/types";

import { Unauthorised } from "@/components/unauthorised";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

import AdminPanel from "./(admin-panel)/admin-panel";
import { StudentOverview } from "./(student)/student-overview";
import { SupervisorOverview } from "./(supervisor)/supervisor-overview";

export async function generateMetadata({ params }: { params: InstanceParams }) {
  const { displayName } = await api.institution.instance.get({ params });

  return { title: metadataTitle([displayName, app.name]) };
}

// TODO: this whole thing needs some tlc tbh
export default async function Page({ params }: { params: InstanceParams }) {
  const isAdmin = await api.ac.isAdminInInstance({ params: params });
  if (isAdmin) return <AdminPanel params={params} />;

  const roles = await api.user.roles({ params });
  if (roles.has(Role.STUDENT)) return <StudentOverview params={params} />;
  if (roles.has(Role.SUPERVISOR)) return <SupervisorOverview params={params} />;
  // TODO: add READER routing

  // could potentially throw error as this should be caught by the layout
  return <Unauthorised message="You don't have permission to view this page" />;
}
