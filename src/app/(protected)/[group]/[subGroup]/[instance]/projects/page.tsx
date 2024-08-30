import { Heading } from "@/components/heading";
import { PageWrapper } from "@/components/page-wrapper";

import { auth } from "@/lib/auth";
import { api } from "@/lib/trpc/server";
import { InstanceParams } from "@/lib/validations/params";
import { instanceTabs as tabs } from "@/lib/validations/tabs/instance";

import { AllProjectsDataTable } from "./_components/all-projects-data-table";

import { app, metadataTitle } from "@/content/config/app";

export async function generateMetadata({ params }: { params: InstanceParams }) {
  const { displayName } = await api.institution.instance.get({ params });

  return {
    title: metadataTitle([tabs.allProjects.title, displayName, app.name]),
  };
}

export default async function Projects({ params }: { params: InstanceParams }) {
  const user = await auth();
  const role = await api.user.role({ params });
  const projects = await api.project.getAllForUser({ params, userId: user.id });

  const preferencesByProject = await api.user.student.preference.getByProject({
    params,
  });

  const hasSelfDefinedProject = await api.user.hasSelfDefinedProject({
    params,
  });

  return (
    <PageWrapper>
      <Heading>{tabs.allProjects.title}</Heading>
      <AllProjectsDataTable
        user={user}
        role={role}
        data={projects}
        projectPreferences={preferencesByProject}
        hasSelfDefinedProject={hasSelfDefinedProject}
      />
    </PageWrapper>
  );
}
