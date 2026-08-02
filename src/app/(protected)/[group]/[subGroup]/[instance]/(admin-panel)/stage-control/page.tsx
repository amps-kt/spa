import { PAGES } from "@/config/pages";

import { Heading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

import { StageControl } from "./_components/stage-control";

export default async function Page(props: { params: Promise<InstanceParams> }) {
  const params = await props.params;
  const stage = await api.institution.instance.getCurrentStage({ params });

  return (
    <PanelWrapper>
      <Heading>{PAGES.stageControl.title}</Heading>
      <StageControl stage={stage} />
    </PanelWrapper>
  );
}
