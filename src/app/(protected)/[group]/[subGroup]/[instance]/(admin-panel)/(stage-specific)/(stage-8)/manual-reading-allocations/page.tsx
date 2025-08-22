import { app, metadataTitle } from "@/config/meta";
import { PAGES } from "@/config/pages";

import { Heading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

import { ManualReadingAllocationDataTableSection } from "./_components/manual-allocation-table-section";

export async function generateMetadata({ params }: { params: InstanceParams }) {
  const { displayName } = await api.institution.instance.get({ params });

  return {
    title: metadataTitle([
      PAGES.manualReadingAllocations.title,
      displayName,
      app.name,
    ]),
  };
}

export default async function Page({ params }: { params: InstanceParams }) {
  const projectData =
    await api.institution.instance.getProjectsWithReadingAllocationStatus({
      params,
    });

  const readerData = await api.institution.instance.getReadersWithWorkload({
    params,
  });

  const projectDescriptors =
    await api.institution.instance.getAllProjectDescriptors({ params });

  const projects = projectData.map(
    ({ project, student, supervisor, currentReaderId }) => ({
      project,
      student,
      supervisor,
      originalReaderId: currentReaderId,
      selectedReaderId: undefined,
      isDirty: false,
      warnings: [],
    }),
  );

  const readers = readerData.map((reader) => ({
    ...reader,
    pendingAllocations: 0,
  }));

  return (
    <PanelWrapper className="gap-10">
      <Heading className="mb-4">Manual Reading Allocations</Heading>
      <ManualReadingAllocationDataTableSection
        initialProjects={projects}
        initialReaders={readers}
        projectDescriptors={projectDescriptors}
      />
    </PanelWrapper>
  );
}
