"use client";

import { useParams } from "next/navigation";
import { toast } from "sonner";

import { type ProjectDTO } from "@/dto";

import { type ExtendedReaderPreferenceType } from "@/db/types";

import DataTable from "@/components/ui/data-table/data-table";

import { api } from "@/lib/trpc/client";
import { type PageParams } from "@/lib/validations/params";

import { useReaderPreferenceColumns } from "./reader-preferences-columns";

export function ReaderPreferencesDataTable({
  data,
}: {
  data: { project: ProjectDTO; type: ExtendedReaderPreferenceType }[];
}) {
  const { id: readerId, ...params } = useParams<PageParams>();

  const { mutateAsync: api_updateReaderPreference } =
    api.institution.instance.updateReaderPreference.useMutation();

  async function updatePreference(
    project: ProjectDTO,
    readingPreferenceType: ExtendedReaderPreferenceType,
  ) {
    toast.promise(
      api_updateReaderPreference({
        params,
        readerId,
        projectId: project.id,
        readingPreference: readingPreferenceType,
      }),
      {
        loading: "Updating reader project preference...",
        error: "Something went wrong",
        success: `Successfully updated reader preference over project (${project.title})`,
      },
    );
  }

  const columns = useReaderPreferenceColumns({ updatePreference });
  return <DataTable columns={columns} data={data} />;
}
