"use client";

import { readingPreferenceOptions } from "@/config/reading-preference";

import { type TagDTO, type FlagDTO, type ProjectDTO, StudentDTO } from "@/dto";

import { type ExtendedReaderPreferenceType } from "@/db/types";

import { useInstanceParams } from "@/components/params-context";
import DataTable from "@/components/ui/data-table/data-table";

import { api } from "@/lib/trpc/client";

import { useAllAvailableProjectsColumns } from "./all-available-projects-columns";

export function AllAvailableProjectsDataTable({
  data: initialData,
  projectDescriptors,
}: {
  data: {
    project: ProjectDTO;
    student: StudentDTO;
    readingPreference: ExtendedReaderPreferenceType;
  }[];
  projectDescriptors: { flags: FlagDTO[]; tags: TagDTO[] };
}) {
  const params = useInstanceParams();

  const { data } = api.project.getAllAvailableForReadingForUser.useQuery(
    { params },
    { initialData },
  );

  const filters = [
    {
      title: "Flags",
      columnId: "Flags",
      options: projectDescriptors.flags.map((flag) => ({
        id: flag.id,
        displayName: flag.displayName,
      })),
    },
    {
      title: "Keywords",
      columnId: "Keywords",
      options: projectDescriptors.tags.map((tag) => ({
        id: tag.id,
        displayName: tag.title,
      })),
    },
    {
      title: "Reading Preference",
      columnId: "Reading Preference",
      options: readingPreferenceOptions,
    },
  ];

  const columns = useAllAvailableProjectsColumns();

  return (
    <DataTable
      className="w-full"
      columns={columns}
      filters={filters}
      data={data}
    />
  );
}
