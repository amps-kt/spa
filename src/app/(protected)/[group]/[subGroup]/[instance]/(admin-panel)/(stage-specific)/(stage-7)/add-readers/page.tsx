import { app, metadataTitle } from "@/config/meta";
import { PAGES } from "@/config/pages";

import { Heading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

import { AddReadersSection } from "./_components/add-readers-section";

export async function generateMetadata(props: {
  params: Promise<InstanceParams>;
}) {
  const params = await props.params;
  const { displayName } = await api.institution.instance.get({ params });

  return {
    title: metadataTitle([PAGES.addReaders.title, displayName, app.name]),
  };
}

export default function Page() {
  return (
    <PanelWrapper>
      <Heading>{PAGES.addReaders.title}</Heading>
      <AddReadersSection />
    </PanelWrapper>
  );
}
