"use client";

import { useCallback, useMemo } from "react";

import { type Row, type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { z } from "zod";

import { flagDtoSchema, type ProjectDTO } from "@/dto";

import {
  ExtendedReaderPreferenceType,
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

// Cells are really just components
// this one is super nasty, so I pulled it out to a separate fn.
// You can safely inline it however
// but because 'cell' doesn't start with an upper case 'c', eslint will cry at you.
function ReadingPreferenceCell({
  row: { original },
}: {
  row: Row<{
    project: ProjectDTO;
    readingPreference: ExtendedReaderPreferenceType;
  }>;
}) {
  const utils = api.useUtils();

  const {
    mutateAsync: api_updatePreference,
    variables,
    isPending,
  } = api.user.reader.updateReadingPreference.useMutation({
    onSettled: async () =>
      utils.project.getAllAvailableForReadingForUser.invalidate(),
  });

  const currentPreference = useMemo<ExtendedReaderPreferenceType>(() => {
    return isPending ? variables.readingPreference : original.readingPreference;
  }, [isPending, original.readingPreference, variables]);

  const params = useInstanceParams();

  const updatePreference = useCallback(
    async (readingPreferenceType: ExtendedReaderPreferenceType) => {
      toast.promise(
        api_updatePreference({
          params,
          projectId: original.project.id,
          readingPreference: readingPreferenceType,
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

  return (
    <ReadingPreferenceButton
      currentPreference={currentPreference}
      setPreference={updatePreference}
    />
  );
}

export function useAllAvailableProjectsColumns(): ColumnDef<{
  project: ProjectDTO;
  readingPreference: ExtendedReaderPreferenceType;
}>[] {
  const baseCols: ColumnDef<{
    project: ProjectDTO;
    readingPreference: ExtendedReaderPreferenceType;
  }>[] = [
    {
      id: "Title",
      accessorFn: ({ project }) => project.title,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({
        row: {
          original: { project },
        },
      }) => (
        <AppInstanceLink
          className={cn(
            buttonVariants({ variant: "link" }),
            "inline-block h-max min-w-60 px-0 text-start",
          )}
          page="projectById"
          linkArgs={{ projectId: project.id }}
        >
          {project.title}
        </AppInstanceLink>
      ),
    },
    {
      id: "Flags",
      accessorFn: (row) => row.project.flags,
      header: () => <div className="text-center">Flags</div>,
      filterFn: (row, columnId, value) => {
        const selectedFilters = z.array(z.string()).parse(value);
        const rowFlags = z.array(flagDtoSchema).parse(row.getValue(columnId));

        return (
          new Set(rowFlags.map((f) => f.id)).size > 0 &&
          selectedFilters.some((f) => rowFlags.some((rf) => rf.id === f))
        );
      },
      cell: ({
        row: {
          original: { project },
        },
      }) => (
        <div className="flex flex-col gap-2">
          {project.flags.length > 2 ? (
            <>
              <Badge
                variant="accent"
                className="w-40 rounded-md"
                key={project.flags[0].id}
              >
                {project.flags[0].displayName}
              </Badge>
              <WithTooltip
                side="right"
                tip={
                  <ul className="flex list-disc flex-col gap-1 p-2 pl-1">
                    {project.flags.slice(1).map((flag) => (
                      <Badge
                        variant="accent"
                        className="w-40 rounded-md"
                        key={flag.id}
                      >
                        {flag.displayName}
                      </Badge>
                    ))}
                  </ul>
                }
              >
                <div
                  className={cn(
                    badgeVariants({ variant: "accent" }),
                    "w-fit rounded-md font-normal",
                  )}
                >
                  {project.flags.length - 1}+
                </div>
              </WithTooltip>
            </>
          ) : (
            project.flags.map((flag) => (
              <Badge variant="accent" className="w-40 rounded-md" key={flag.id}>
                {flag.displayName}
              </Badge>
            ))
          )}
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
              <Badge
                variant="outline"
                className="w-fit"
                key={project.tags[0].id}
              >
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
      accessorFn: (row) =>
        row.readingPreference ?? ExtendedReaderPreferenceType.ACCEPTABLE,
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

  return baseCols;
}
