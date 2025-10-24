import { NextResponse } from "next/server";
import { unparse } from "papaparse";

import { redirect } from "@/lib/routing";
import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

// I know this is a radical departure from how we normally handle CSV downloads
// But I think it's a cleaner way to handle them

interface CSVRow {
  readerId: string;
  projectId: string;
  type: "CONFLICT" | "PREFERABLE" | "UNACCEPTABLE";
}

export async function GET(
  _request: Request,
  { params }: { params: InstanceParams },
) {
  // We have to do our own AC here (since there is no layout to do it for us):
  const isAdmin = await api.ac.adminInInstance({ params });
  if (!isAdmin) return redirect("unauthorised", undefined);

  // We then get the data we need:
  const readerPreferences =
    await api.institution.instance.getAllReaderPreferences({ params });

  const data: CSVRow[] = readerPreferences
    .flatMap((r) => {
      const readerId = r.id;
      const conflicts = r.conflict.map((e) => ({
        readerId,
        projectId: e,
        type: "CONFLICT" as const,
      }));

      const prefs = r.preferable.map((e) => ({
        readerId,
        projectId: e,
        type: "PREFERABLE" as const,
      }));

      const unacceptable = r.unacceptable.map((e) => ({
        readerId,
        projectId: e,
        type: "UNACCEPTABLE" as const,
      }));

      return [conflicts, prefs, unacceptable];
    })
    .flat();

  // unparse it...
  const csvText = unparse(data);

  // And then we can just return it as a plain response;
  // The result is we get a preference CSV
  return new NextResponse(csvText);
}
