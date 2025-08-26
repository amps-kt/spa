"use client";

import { toast } from "sonner";

import { type ProjectDTO } from "@/dto";

import { type ReaderPreferenceType } from "@/db/types";

import { useInstanceParams } from "@/components/params-context";
import DataTable from "@/components/ui/data-table/data-table";

import { api } from "@/lib/trpc/client";

import { useMyReadingPreferenceColumns } from "./my-reading-preferences-columns";

export function MyReadingPreferencesDataTable({
  data,
}: {
  data: { project: ProjectDTO; type: ReaderPreferenceType }[];
}) {
  const params = useInstanceParams();

  const { mutateAsync: api_updatePreference } =
    api.user.reader.updateReadingPreference.useMutation();

  async function updatePreference(
    project: ProjectDTO,
    readingPreferenceType: ReaderPreferenceType | undefined,
  ) {
    return await toast
      .promise(
        api_updatePreference({
          params,
          projectId: project.id,
          readingPreference: readingPreferenceType,
        }),
        {
          loading: "Updating project preference...",
          error: "Something went wrong",
          success: `Successfully updated preference over project (${project.title})`,
        },
      )
      .unwrap();
  }

  const columns = useMyReadingPreferenceColumns({ updatePreference });
  return <DataTable columns={columns} data={data} />;
}
