"use client";

import { useCallback, useMemo } from "react";

import { type Row, type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { z } from "zod";

import { type StudentDTO, type ProjectDTO } from "@/dto";

import {
  type ExtendedReaderPreferenceType,
  extendedReaderPreferenceTypeSchema,
} from "@/db/types";

import { useInstanceParams } from "@/components/params-context";
import { ReadingPreferenceButton } from "@/components/reading-preference-button";
import { tagTypeSchema } from "@/components/tag/tag-input";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { AppInstanceLink } from "@/lib/routing";
import { api } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

function ReadingPreferenceCell({
  row: { original },
}: {
  row: Row<{
    project: ProjectDTO;
    student: StudentDTO;
    type: ExtendedReaderPreferenceType;
  }>;
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

export const myReadingPreferenceColumns: ColumnDef<{
  project: ProjectDTO;
  student: StudentDTO;
  type: ExtendedReaderPreferenceType;
}>[] = [
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
    id: "Flag",
    accessorFn: (row) => row.student.flag,
    header: () => <div className="text-center">Flag</div>,
    filterFn: (row, _columnId, value) => {
      const selectedFilters = z.array(z.string()).parse(value);
      const rowFlag = row.original.student.flag;
      return selectedFilters.some((f) => rowFlag.id === f);
    },
    cell: ({
      row: {
        original: {
          student: { flag },
        },
      },
    }) => (
      <div className="flex flex-col gap-2">
        <Badge variant="accent" className="w-40 rounded-md">
          {flag.displayName}
        </Badge>
      </div>
    ),
  },
  {
    id: "Keywords",
    accessorFn: (row) => row.project.tags,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Keywords" />
    ),
    filterFn: (row, columnId, value) => {
      const ids = value as string[];
      const rowTags = z.array(tagTypeSchema).parse(row.getValue(columnId));
      return rowTags.some((e) => ids.includes(e.id));
    },
    cell: ({
      row: {
        original: { project },
      },
    }) => (
      <div className="flex flex-col gap-2">
        {project.tags.length > 2 ? (
          <>
            <Badge variant="outline" className="w-fit" key={project.tags[0].id}>
              {project.tags[0].title}
            </Badge>
            <WithTooltip
              side="right"
              tip={
                <ul className="flex list-disc flex-col gap-1 p-2 pl-1">
                  {project.tags.slice(1).map((tag) => (
                    <Badge variant="outline" className="w-fit" key={tag.id}>
                      {tag.title}
                    </Badge>
                  ))}
                </ul>
              }
            >
              <div
                className={cn(
                  badgeVariants({ variant: "outline" }),
                  "w-fit font-normal",
                )}
              >
                {project.tags.length - 1}+
              </div>
            </WithTooltip>
          </>
        ) : (
          project.tags.map((tag) => (
            <Badge variant="outline" className="w-fit" key={tag.id}>
              {tag.title}
            </Badge>
          ))
        )}
      </div>
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
