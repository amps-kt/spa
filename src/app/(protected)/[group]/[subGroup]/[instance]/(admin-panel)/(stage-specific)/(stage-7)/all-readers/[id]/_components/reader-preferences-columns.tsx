"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { z } from "zod";

import { type ProjectDTO } from "@/dto";

import {
  ExtendedReaderPreferenceType,
  extendedReaderPreferenceTypeSchema,
  type MaybeReaderPreferenceType,
  type ReaderPreferenceType,
} from "@/db/types";

import { useInstanceParams } from "@/components/params-context";
import { ReadingPreferenceButton } from "@/components/reading-preference-button";
import { buttonVariants } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";

import { AppInstanceLink } from "@/lib/routing";
import { cn } from "@/lib/utils";

export function useReaderPreferenceColumns({
  updatePreference,
}: {
  updatePreference: (
    project: ProjectDTO,
    newType: MaybeReaderPreferenceType,
  ) => Promise<MaybeReaderPreferenceType>;
}): ColumnDef<{ project: ProjectDTO; type: ReaderPreferenceType }>[] {
  const params = useInstanceParams();

  return [
    {
      id: "Project",
      accessorFn: ({ project }) => project.title,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Project" />
      ),
      cell: ({
        row: {
          original: { project },
        },
      }) => (
        <AppInstanceLink
          page="projectById"
          linkArgs={{ params, projectId: project.id }}
          className={cn(
            buttonVariants({ variant: "link" }),
            "inline-block h-max min-w-60 px-0 text-start",
          )}
        >
          {project.title}
        </AppInstanceLink>
      ),
    },
    {
      id: "Reading Preference",
      accessorFn: (row) => row.type ?? ExtendedReaderPreferenceType.ACCEPTABLE,
      header: ({ column }) => (
        <DataTableColumnHeader title="Reading Preference" column={column} />
      ),
      cell: ({
        row: {
          original: { project, type: currentPreference },
        },
      }) => (
        // ! UI state does not update correctly, idk what to do
        <ReadingPreferenceButton
          currentPreference={currentPreference}
          setPreference={async (type) => await updatePreference(project, type)}
        />
      ),
      filterFn: (row, columnId, value) => {
        return z
          .array(extendedReaderPreferenceTypeSchema)
          .parse(value)
          .includes(row.getValue<ExtendedReaderPreferenceType>(columnId));
      },
    },
  ];
}
