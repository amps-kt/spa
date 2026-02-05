import { app, metadataTitle } from "@/config/meta";
import { PAGES } from "@/config/pages";

import { Heading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

export async function generateMetadata({ params }: { params: InstanceParams }) {
  const { displayName } = await api.institution.instance.get({ params });

  return {
    title: metadataTitle([
      PAGES.studentSubmissions.title,
      displayName,
      app.name,
    ]),
  };
}

export default async function Page() {
  return (
    <PanelWrapper>
      <Heading>{PAGES.studentSubmissions.title}</Heading>
    </PanelWrapper>
  );
}
