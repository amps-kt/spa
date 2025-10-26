import { NextResponse } from "next/server";
import { unparse } from "papaparse";

import { type ExtendedReaderPreferenceType } from "@/db/types";

import { redirect } from "@/lib/routing";
import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

interface ReaderMatchingRow {
  projectId: string;
  projectTitle: string;

  supervisorId: string;
  supervisorName: string;
  supervisorEmail: string;

  studentId: string;
  studentEmail: string;
  studentName: string;

  readerId?: string;
  readerName?: string;
  readerEmail?: string;
  readerPreferenceType?: ExtendedReaderPreferenceType;
}

export async function GET(
  _request: Request,
  { params }: { params: InstanceParams },
) {
  const isAdmin = await api.ac.isAdminInInstance({ params });
  if (!isAdmin) return redirect("unauthorised", undefined);

  const matching = await api.institution.instance.getReaderAllocation({
    params,
  });

  const data = matching.map(
    ({ project, supervisor, reader, student, preferenceType }) =>
      ({
        projectId: project.id,
        projectTitle: project.title,

        supervisorId: supervisor.id,
        supervisorName: supervisor.name,
        supervisorEmail: supervisor.email,

        studentId: student.id,
        studentEmail: student.email,
        studentName: student.name,

        readerId: reader?.id,
        readerName: reader?.name,
        readerEmail: reader?.email,
        readerPreferenceType: preferenceType,
      }) as ReaderMatchingRow,
  );

  const csvText = unparse(data);

  // And then we can just return it as a plain response;
  // The result is we get a preference CSV
  return new NextResponse(csvText);
}
