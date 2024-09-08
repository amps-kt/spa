import { DatabaseIcon, ZapIcon } from "lucide-react";

import { CopyEmailsButton } from "@/components/copy-emails-button.tsx";
import { SectionHeading, SubHeading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";
import { Card, CardContent } from "@/components/ui/card";

import { api } from "@/lib/trpc/server";
import { InstanceParams } from "@/lib/validations/params";
import { adminTabs } from "@/lib/validations/tabs/admin-panel";

import { StudentInvitesDataTable } from "./_components/student-invites-data-table";

import { app, metadataTitle } from "@/content/config/app";
import { pages } from "@/content/pages";

export async function generateMetadata({ params }: { params: InstanceParams }) {
  const { displayName } = await api.institution.instance.get({ params });

  return {
    title: metadataTitle([pages.studentInvites.title, displayName, app.name]),
  };
}

export default async function Page({ params }: { params: InstanceParams }) {
  const { students } = await api.institution.instance.invitedStudents({
    params,
  });

  const incomplete = students.filter((student) => !student.joined);

  // TODO: don't include students with self-defined projects

  return (
    <PanelWrapper className="mt-10 flex flex-col items-start gap-16 px-12">
      <SubHeading className="mb-4">{adminTabs.studentInvites.title}</SubHeading>
      <section className="flex flex-col gap-5">
        <SectionHeading className="flex items-center">
          <ZapIcon className="mr-2 h-6 w-6 text-indigo-500" />
          <span>Quick Actions</span>
        </SectionHeading>
        <Card className="w-full">
          <CardContent className="mt-6 flex items-center justify-between gap-10">
            {incomplete.length !== 0 ? (
              <>
                <p>
                  <span className="font-semibold">{incomplete.length}</span> out
                  of <span className="font-semibold">{students.length}</span>{" "}
                  students have not joined the platform yet
                </p>
                <CopyEmailsButton data={incomplete} />
              </>
            ) : (
              <p>All students have joined the platform</p>
            )}
          </CardContent>
        </Card>
      </section>
      <section className="flex w-full flex-col gap-5">
        <SectionHeading className="flex items-center">
          <DatabaseIcon className="mr-2 h-6 w-6 text-indigo-500" />
          <span>All data</span>
        </SectionHeading>
        <StudentInvitesDataTable data={students} />
      </section>
    </PanelWrapper>
  );
}
