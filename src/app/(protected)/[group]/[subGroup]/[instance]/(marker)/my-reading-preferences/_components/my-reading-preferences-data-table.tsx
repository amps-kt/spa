"use client";

import { useMemo } from "react";

import { type StudentDTO, type ProjectDTO } from "@/dto";

import { ExtendedReaderPreferenceType } from "@/db/types";

import { useInstanceParams } from "@/components/params-context";
import DataTable from "@/components/ui/data-table/data-table";

import { api } from "@/lib/trpc/client";

import { myReadingPreferenceColumns } from "./my-reading-preferences-columns";

export function MyReadingPreferencesDataTable({
  initialData,
}: {
  initialData: {
    project: ProjectDTO;
    student: StudentDTO;
    type: ExtendedReaderPreferenceType;
  }[];
}) {
  const params = useInstanceParams();

  const { data: currentData } = api.user.reader.getReadingPreferences.useQuery(
    { params },
    { initialData },
  );

  const displayData = useMemo(
    () =>
      initialData.map(({ project, student }) => ({
        project,
        student,
        type:
          currentData.find((p) => p.project.id === project.id)?.type ??
          ExtendedReaderPreferenceType.ACCEPTABLE,
      })),
    [currentData, initialData],
  );

  return <DataTable columns={myReadingPreferenceColumns} data={displayData} />;
}
