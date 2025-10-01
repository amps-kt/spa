import { DownloadIcon, FileChartColumnIcon, ZapIcon } from "lucide-react";

import { app, metadataTitle } from "@/config/meta";
import { PAGES } from "@/config/pages";

import { Heading, SectionHeading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

import { ReaderPreferencesDataTable } from "./_components/reader-preference-data-table";

export async function generateMetadata({ params }: { params: InstanceParams }) {
  const { displayName } = await api.institution.instance.get({ params });

  return {
    title: metadataTitle([PAGES.allReaders.title, displayName, app.name]),
  };
}

export default async function Page({ params }: { params: InstanceParams }) {
  const data = await api.institution.instance.getReaderPreferenceData({
    params,
  });

  const numReaders = data.length;
  const numMissing = data.filter(
    (x) => x.numPreferred === 0 && x.numVetoed === 0,
  ).length;

  return (
    <PanelWrapper className="mt-5 gap-10">
      <Heading>{PAGES.readerPreferenceOverview.title}</Heading>
      <section className="flex flex-col gap-5">
        <SectionHeading icon={ZapIcon}>Quick Actions</SectionHeading>
        <Card>
          <CardContent className="mt-6 flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <p>
                <span className="font-semibold">{numMissing}</span> out of{" "}
                <span className="font-semibold">{numReaders}</span> Readers have
                not submitted their preference list.
              </p>
              {/* TODO implement below */}
              <Button variant="outline" className="w-54 justify-between">
                <DownloadIcon className="size-4" />
                Download Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
      <section>
        <SectionHeading icon={FileChartColumnIcon}>
          Reader Preferences
        </SectionHeading>
        <ReaderPreferencesDataTable data={data} />
      </section>
    </PanelWrapper>
  );
}
