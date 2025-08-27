"use client";

import { useMemo } from "react";

import { useParams } from "next/navigation";

import { type ProjectDTO } from "@/dto";

import { ExtendedReaderPreferenceType } from "@/db/types";

import DataTable from "@/components/ui/data-table/data-table";

import { api } from "@/lib/trpc/client";
import { type PageParams } from "@/lib/validations/params";

import { useReaderPreferenceColumns } from "./reader-preferences-columns";

export function ReaderPreferencesDataTable({
  initialData,
}: {
  initialData: { project: ProjectDTO; type: ExtendedReaderPreferenceType }[];
}) {
  const { id: readerId, ...params } = useParams<PageParams>();

  const { data: currentData } =
    api.institution.instance.getReaderPreferences.useQuery(
      { params, readerId },
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

  const columns = useReaderPreferenceColumns();
  return <DataTable columns={columns} data={displayData} />;
}
