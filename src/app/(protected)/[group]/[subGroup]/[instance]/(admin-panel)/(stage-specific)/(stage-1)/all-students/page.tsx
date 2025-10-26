import { app, metadataTitle } from "@/config/meta";
import { PAGES } from "@/config/pages";

import { Heading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

import { StudentsDataTable } from "./_components/all-students-data-table";

export async function generateMetadata({ params }: { params: InstanceParams }) {
  const { displayName } = await api.institution.instance.get({ params });

  return {
    title: metadataTitle([PAGES.allStudents.title, displayName, app.name]),
  };
}

export default async function Students({ params }: { params: InstanceParams }) {
  const data = await api.institution.instance.getStudentsWithAllocation({
    params,
  });

  const flags = await api.institution.instance.getFlags({ params });

  return (
    <PanelWrapper>
      <Heading>{PAGES.allStudents.title}</Heading>
      <StudentsDataTable data={data} flags={flags} />
    </PanelWrapper>
  );
}
