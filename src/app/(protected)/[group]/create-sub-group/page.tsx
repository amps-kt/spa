import { app, metadataTitle } from "@/config/meta";
import { PAGES } from "@/config/pages";
import { spacesLabels } from "@/config/spaces";

import { Heading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";

import { api } from "@/lib/trpc/server";
import { forbidden } from "@/lib/utils/redirect";
import { type GroupParams } from "@/lib/validations/params";

import { FormSection } from "./_components/form-section";

export async function generateMetadata({ params }: { params: GroupParams }) {
  const { displayName } = await api.institution.group.get({ params });

  return {
    title: metadataTitle([PAGES.newSubGroup.title, displayName, app.name]),
  };
}

export default async function Page({ params }: { params: GroupParams }) {
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
