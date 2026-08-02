import { app, metadataTitle } from "@/config/meta";
import { PAGES } from "@/config/pages";

import { Heading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

import { MyReadingPreferencesDataTable } from "./_components/my-reading-preferences-data-table";

export async function generateMetadata(props: {
  params: Promise<InstanceParams>;
}) {
  const params = await props.params;
  const { displayName } = await api.institution.instance.get({ params });

  return {
    title: metadataTitle([
      PAGES.myReadingPreferences.title,
      displayName,
      app.name,
    ]),
  };
}

export default async function Page(props: { params: Promise<InstanceParams> }) {
  const params = await props.params;
  const readingPreferences = await api.user.reader.getReadingPreferences({
    params,
  });

  return (
    <PanelWrapper className="gap-10">
      <Heading>{PAGES.myReadingPreferences.title}</Heading>
      <MyReadingPreferencesDataTable initialData={readingPreferences} />
    </PanelWrapper>
  );
}
