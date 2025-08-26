"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { type TagDTO, type FlagDTO, type ProjectDTO } from "@/dto";

import { type ReaderPreferenceType } from "@/db/types";

import { useInstanceParams } from "@/components/params-context";
import DataTable from "@/components/ui/data-table/data-table";

import { api } from "@/lib/trpc/client";
import { readingPreferenceOptions } from "@/lib/utils/reader-preference";

import { useAllAvailableProjectsColumns } from "./all-available-projects-columns";

export function AllAvailableProjectsDataTable({
  data,

  projectDescriptors,
}: {
  data: {
    project: ProjectDTO;
    readingPreference: ReaderPreferenceType | undefined;
  }[];

  projectDescriptors: { flags: FlagDTO[]; tags: TagDTO[] };
}) {
  const router = useRouter();
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
      .unwrap()
      .then((data) => {
        router.refresh();
        return data;
      });
  }

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

  const columns = useAllAvailableProjectsColumns({ updatePreference });

  return (
    <DataTable
      className="w-full"
      columns={columns}
      filters={filters}
      data={data}
    />
  );
}
