"use client";

import { useCallback, useMemo } from "react";

import { type Row, type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { z } from "zod";

import { type ProjectDTO } from "@/dto";

import {
  type ExtendedReaderPreferenceType,
  extendedReaderPreferenceTypeSchema,
} from "@/db/types";

import { useInstanceParams } from "@/components/params-context";
import { ReadingPreferenceButton } from "@/components/reading-preference-button";
import { buttonVariants } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";

import { AppInstanceLink } from "@/lib/routing";
import { api } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

function ReadingPreferenceCell({
  row: { original },
}: {
  row: Row<{ project: ProjectDTO; type: ExtendedReaderPreferenceType }>;
}) {
  const utils = api.useUtils();
  const {
    mutateAsync: api_updatePreference,
    isPending,
    variables,
  } = api.user.reader.updateReadingPreference.useMutation({
    onSettled: () => utils.user.reader.getReadingPreferences.invalidate(),
  });

  const params = useInstanceParams();

  const updatePreference = useCallback(
    async (readingPreference: ExtendedReaderPreferenceType) => {
      toast.promise(
        api_updatePreference({
          params,
          readingPreference,
          projectId: original.project.id,
        }),
        {
          loading: "Updating project preference...",
          error: "Something went wrong",
          success: `Successfully updated preference over project (${original.project.title})`,
        },
      );
    },
    [api_updatePreference, params, original],
  );

  const currentPreference = useMemo<ExtendedReaderPreferenceType>(() => {
    return isPending ? variables.readingPreference : original.type;
  }, [isPending, original, variables]);

  return (
    <ReadingPreferenceButton
      currentPreference={currentPreference}
      setPreference={updatePreference}
    />
  );
}

export function useMyReadingPreferenceColumns(): ColumnDef<{
  project: ProjectDTO;
  type: ExtendedReaderPreferenceType;
}>[] {
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
          linkArgs={{ projectId: project.id }}
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
      accessorFn: (row) => row.type,
      header: ({ column }) => (
        <DataTableColumnHeader title="Reading Preference" column={column} />
      ),
      cell: ReadingPreferenceCell,
      filterFn: (row, columnId, value) => {
        return z
          .array(extendedReaderPreferenceTypeSchema)
          .parse(value)
          .includes(row.getValue<ExtendedReaderPreferenceType>(columnId));
      },
    },
  ];
}
