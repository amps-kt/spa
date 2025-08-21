import { app, metadataTitle } from "@/config/meta";
import { PAGES } from "@/config/pages";

import { Heading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

import { AllAvailableProjectsDataTable } from "./_components/all-available-projects-data-table";

export async function generateMetadata({ params }: { params: InstanceParams }) {
  const { displayName } = await api.institution.instance.get({ params });

  return {
    title: metadataTitle([
      PAGES.allAvailableProjects.title,
      displayName,
      app.name,
    ]),
  };
}

export default async function Projects({ params }: { params: InstanceParams }) {
  const projectData = await api.project.getAllAvailableForReadingForUser({
    params,
  });

  const projectDescriptors =
    await api.institution.instance.getUsedProjectDescriptors({ params });

  return (
    <PanelWrapper>
      <Heading>{PAGES.allAvailableProjects.title}</Heading>
      <AllAvailableProjectsDataTable
        data={projectData}
        projectDescriptors={projectDescriptors}
      />
    </PanelWrapper>
  );
}
