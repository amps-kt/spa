"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { z } from "zod";

import { PAGES } from "@/config/pages";

import { flagDtoSchema, type ProjectDTO } from "@/dto";

import {
  ExtendedReaderPreferenceType,
  extendedReaderPreferenceTypeSchema,
  type MaybeReaderPreferenceType,
} from "@/db/types";

import { usePathInInstance } from "@/components/params-context";
import { tagTypeSchema } from "@/components/tag/tag-input";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { cn } from "@/lib/utils";

import { ReadingPreferenceButton } from "./reading-preference-button";

export function useAllAvailableProjectsColumns({
  updatePreference,
}: {
  updatePreference: (
    project: ProjectDTO,
    newType: MaybeReaderPreferenceType,
  ) => Promise<MaybeReaderPreferenceType>;
}): ColumnDef<{
  project: ProjectDTO;
  readingPreference: MaybeReaderPreferenceType;
}>[] {
  const { getInstancePath } = usePathInInstance();

  const baseCols: ColumnDef<{
    project: ProjectDTO;
    readingPreference: MaybeReaderPreferenceType;
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
        <Link
          className={cn(
            buttonVariants({ variant: "link" }),
            "inline-block h-max min-w-60 px-0 text-start",
          )}
          href={getInstancePath([PAGES.allProjects.href, project.id])}
        >
          {project.title}
        </Link>
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
      cell: ({ row: { original } }) => {
        return (
          <ReadingPreferenceButton
            currentPreference={original.readingPreference}
            handleToggle={async (type) =>
              await updatePreference(original.project, type)
            }
          />
        );
      },
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
