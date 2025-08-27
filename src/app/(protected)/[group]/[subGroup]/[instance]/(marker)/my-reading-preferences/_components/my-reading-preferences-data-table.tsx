"use client";

import { useMemo } from "react";

import { type ProjectDTO } from "@/dto";

import { ExtendedReaderPreferenceType } from "@/db/types";

import { useInstanceParams } from "@/components/params-context";
import DataTable from "@/components/ui/data-table/data-table";

import { api } from "@/lib/trpc/client";

import { useMyReadingPreferenceColumns } from "./my-reading-preferences-columns";

export function MyReadingPreferencesDataTable({
  initialData,
}: {
  initialData: { project: ProjectDTO; type: ExtendedReaderPreferenceType }[];
}) {
  const params = useInstanceParams();

  const { data: currentData } = api.user.reader.getReadingPreferences.useQuery(
    { params },
    { initialData },
  );

  const displayData = useMemo(
    () =>
      initialData.map(({ project }) => ({
        project,
        type:
          currentData.find((p) => p.project.id === project.id)?.type ??
          ExtendedReaderPreferenceType.ACCEPTABLE,
      })),
    [currentData, initialData],
  );

  const columns = useMyReadingPreferenceColumns();
  return <DataTable columns={columns} data={displayData} />;
}
