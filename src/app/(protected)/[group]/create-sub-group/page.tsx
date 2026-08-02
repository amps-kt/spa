import { app, metadataTitle } from "@/config/meta";
import { PAGES } from "@/config/pages";
import { spacesLabels } from "@/config/spaces";

import { Heading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";

import { forbidden } from "@/lib/routing";
import { api } from "@/lib/trpc/server";
import { type GroupParams } from "@/lib/validations/params";

import { FormSection } from "./_components/form-section";

export async function generateMetadata(props: {
  params: Promise<GroupParams>;
}) {
  const params = await props.params;
  const { displayName } = await api.institution.group.get({ params });

  return {
    title: metadataTitle([PAGES.newSubGroup.title, displayName, app.name]),
  };
}

export default async function Page(props: { params: Promise<GroupParams> }) {
  const params = await props.params;
  const access = await api.institution.group.access({ params });
  if (!access) forbidden();

  const takenNames = await api.institution.group.getAllTakenSubGroupNames({
    params,
  });

  return (
    <PanelWrapper className="mt-5 gap-10">
      <Heading className="text-4xl">
        Create new {spacesLabels.subGroup.full}
      </Heading>
      <FormSection takenNames={takenNames} params={params} />
    </PanelWrapper>
  );
}
