import { app, metadataTitle } from "@/config/meta";
import { PAGES } from "@/config/pages";

import { Heading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

import { StudentSubmissionsDataTable3 } from "./_components/student-submissions-table-3";

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

export default async function Page({ params }: { params: InstanceParams }) {
  const data = await api.teachingOffice.getStudentSubmissionInfo({ params });
  return (
    <PanelWrapper>
      <Heading>{PAGES.studentSubmissions.title}</Heading>
      <StudentSubmissionsDataTable3 data={data} />
    </PanelWrapper>
  );
}
