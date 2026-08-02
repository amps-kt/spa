import { app, metadataTitle } from "@/config/meta";
import { PAGES } from "@/config/pages";

import { Heading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

import { ReadersDataTable } from "./_components/all-readers-data-table";

export async function generateMetadata(props: {
  params: Promise<InstanceParams>;
}) {
  const params = await props.params;
  const { displayName } = await api.institution.instance.get({ params });

  return {
    title: metadataTitle([PAGES.allReaders.title, displayName, app.name]),
  };
}

export default async function Page(props: { params: Promise<InstanceParams> }) {
  const params = await props.params;
  const roles = await api.user.roles({ params });
  const data = await api.institution.instance.getReaders({ params });

  return (
    <PanelWrapper>
      <Heading>{PAGES.allReaders.title}</Heading>
      <ReadersDataTable roles={roles} data={data} />
    </PanelWrapper>
  );
}
