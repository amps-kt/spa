import { app, metadataTitle } from "@/config/meta";
import { PAGES } from "@/config/pages";

import { Heading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";

import { api } from "@/lib/trpc/server";
import { keyBy } from "@/lib/utils/key-by";
import { type InstanceParams } from "@/lib/validations/params";

import { StudentSubmissionsDataTable } from "./_components/student-submissions-table";

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
  const flags = await api.institution.instance.getFlags({ params });

  const studentSubmissions = await Promise.all(
    flags.map((flag) =>
      api.teachingOffice.getFlagStudentSubmissionInfo({
        params,
        flagId: flag.id,
      }),
    ),
  );

  const studentMap = keyBy(
    studentSubmissions.flatMap((x) => x.data),
    (x) => x.student.id,
    (x) => x.student,
  );

  const uoaMap = keyBy(
    studentSubmissions.flatMap((x) => x.data[0].units),
    (x) => x.unit.id,
    (x) => x.unit,
  );

  return (
    <PanelWrapper>
      <Heading>{PAGES.studentSubmissions.title}</Heading>
      <StudentSubmissionsDataTable
        rowData={studentSubmissions}
        availableFlags={flags}
        studentMap={studentMap}
        uoaMap={uoaMap}
      />
    </PanelWrapper>
  );
}
