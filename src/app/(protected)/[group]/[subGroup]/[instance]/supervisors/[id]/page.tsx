import { notFound } from "next/navigation";

import { Heading, SubHeading } from "@/components/heading";
import { PageWrapper } from "@/components/page-wrapper";

import { api } from "@/lib/trpc/server";
import { InstanceParams } from "@/lib/validations/params";

import { SupervisorProjectsDataTable } from "./_components/supervisor-projects-data-table";

import { app, metadataTitle } from "@/content/config/app";
import { pages } from "@/content/pages";

type PageParams = InstanceParams & { id: string };

export async function generateMetadata({ params }: { params: PageParams }) {
  const { displayName } = await api.institution.instance.get({ params });
  const { name } = await api.user.getById({ userId: params.id });

  return {
    title: metadataTitle([
      name,
      pages.allSupervisors.title,
      displayName,
      app.name,
    ]),
  };
}

export default async function Page({ params }: { params: PageParams }) {
  const supervisorId = params.id;
  const exists = await api.user.supervisor.exists({
    params,
    supervisorId,
  });
  if (!exists) notFound();

  const { supervisor, projects } = await api.user.supervisor.instanceData({
    params,
    supervisorId,
  });

  return (
    <PageWrapper>
      <Heading>{supervisor.name}</Heading>
      <SubHeading>Details</SubHeading>
      <div className="flex flex-col">
        <div className="flex gap-2">
          <span className="w-16 font-semibold text-slate-500">ID:</span>
          <p className="col-span-9">{supervisorId}</p>
        </div>
        <div className="flex gap-2">
          <span className="w-16 font-semibold text-slate-500">Email:</span>
          <p className="col-span-9">{supervisor.email}</p>
        </div>
      </div>
      <SubHeading className="mt-6">All Projects</SubHeading>
      <SupervisorProjectsDataTable data={projects} />
    </PageWrapper>
  );
}
