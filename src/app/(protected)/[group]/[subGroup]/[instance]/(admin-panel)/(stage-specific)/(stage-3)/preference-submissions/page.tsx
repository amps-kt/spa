import { BarChartBigIcon, DatabaseIcon, ZapIcon } from "lucide-react";

import { app, metadataTitle } from "@/config/meta";
import { PAGES } from "@/config/pages";

import { CopyEmailsButton } from "@/components/copy-emails-button";
import { Heading, SectionHeading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";
import { Card, CardContent } from "@/components/ui/card";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

import { PreferenceSubmissionsDataTable } from "./_components/preference-submissions-data-table";
import { SummarySection } from "./_components/summary-section";

export async function generateMetadata({ params }: { params: InstanceParams }) {
  const { displayName } = await api.institution.instance.get({ params });

  return {
    title: metadataTitle([
      PAGES.preferenceSubmissions.title,
      displayName,
      app.name,
    ]),
  };
}

export default async function Page({ params }: { params: InstanceParams }) {
  const allStudents =
    await api.institution.instance.preference.studentSubmissions({ params });

  const projectDescriptors =
    await api.institution.instance.getAllProjectDescriptors({ params });

  const incomplete = allStudents.filter((s) => !s.submitted && !s.preAllocated);
  const preAllocated = allStudents.filter((s) => s.preAllocated);

  return (
    <PanelWrapper className="gap-16">
      <Heading className="mb-4">{PAGES.preferenceSubmissions.title}</Heading>
      <section className="flex flex-col gap-5">
        <SectionHeading icon={ZapIcon}>Quick Actions</SectionHeading>
        <Card className="w-full">
          <CardContent className="mt-6 flex items-center justify-between gap-10">
            {incomplete.length !== 0 ? (
              <>
                <p>
                  <span className="font-semibold">{incomplete.length}</span> out
                  of{" "}
                  <span className="font-semibold">
                    {allStudents.length - preAllocated.length}
                  </span>{" "}
                  students have not submitted their preference list.{" "}
                  <span className="font-semibold">{preAllocated.length}</span>{" "}
                  have self-defined projects.
                </p>
                <div className="flex w-44 items-center">
                  <CopyEmailsButton
                    data={incomplete.map((s) => s.student)}
                    className="w-36"
                  />
                </div>
              </>
            ) : (
              <p>All students have submitted their preference list</p>
            )}
          </CardContent>
        </Card>
      </section>
      <section className="flex w-full flex-col gap-5">
        <SectionHeading icon={BarChartBigIcon}>Summary</SectionHeading>
        <SummarySection
          data={{
            all: allStudents.length,
            incomplete: incomplete.length,
            preAllocated: preAllocated.length,
            submitted: allStudents.length - incomplete.length,
          }}
        />
      </section>
      <section className="flex w-full flex-col gap-5">
        <SectionHeading icon={DatabaseIcon}>All data</SectionHeading>
        <PreferenceSubmissionsDataTable
          data={allStudents}
          projectDescriptors={projectDescriptors}
        />
      </section>
    </PanelWrapper>
  );
}
