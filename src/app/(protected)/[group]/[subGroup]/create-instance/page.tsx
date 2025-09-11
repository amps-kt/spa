import { notFound } from "next/navigation";

import { app, metadataTitle } from "@/config/meta";
import { PAGES } from "@/config/pages";
import { spacesLabels } from "@/config/spaces";

import { Heading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";

import { api } from "@/lib/trpc/server";
import { forbidden } from "@/lib/utils/redirect";
import { type SubGroupParams } from "@/lib/validations/params";

import { WizardSection } from "./_components/wizard-section";

export async function generateMetadata({ params }: { params: SubGroupParams }) {
  const allocationSubGroup = await api.institution.subGroup.exists({ params });
  if (!allocationSubGroup) notFound();

  const { displayName } = await api.institution.subGroup.get({ params });

  return {
    title: metadataTitle([PAGES.newInstance.title, displayName, app.name]),
  };
}

export default async function Page({ params }: { params: SubGroupParams }) {
  const access = await api.institution.subGroup.access({ params });
  if (!access) forbidden();

  const takenNames = await api.institution.subGroup.getAllTakenInstanceNames({
    params,
  });

  return (
    <PanelWrapper className="mt-5 gap-10">
      <Heading className="text-4xl">
        Create new {spacesLabels.instance.full}
      </Heading>
      <WizardSection params={params} takenNames={takenNames} />
    </PanelWrapper>
  );
}
