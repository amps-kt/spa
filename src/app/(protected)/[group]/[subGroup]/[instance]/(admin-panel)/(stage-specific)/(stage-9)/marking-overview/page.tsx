import { ZapIcon } from "lucide-react";

import { metadataTitle, app } from "@/config/meta";
import { PAGES } from "@/config/pages";

import { Heading, SectionHeading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";
import { Card, CardContent } from "@/components/ui/card";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

import { MarkingOverviewTabs } from "./tabs";

export async function generateMetadata({ params }: { params: InstanceParams }) {
  const { displayName } = await api.institution.instance.get({ params });

  return {
    title: metadataTitle([PAGES.markingOverview.title, displayName, app.name]),
  };
}

export default async function Page({ params }: { params: InstanceParams }) {
  return (
    <PanelWrapper className="gap-10">
      <Heading>{PAGES.markingOverview.title}</Heading>

      <section className="flex flex-col gap-5">
        <SectionHeading icon={ZapIcon}>Quick Actions</SectionHeading>
        <Card className="w-full">
          <CardContent className="mt-6 flex items-center justify-between gap-10">
            <p>Notify all late markers</p>
            <p>Download CSVs</p>
          </CardContent>
        </Card>
      </section>

      <MarkingOverviewTabs params={params} />
    </PanelWrapper>
  );
}
