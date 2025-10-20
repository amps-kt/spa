"use client";

import { type ColumnDef } from "@tanstack/react-table";
import z from "zod";

import {
  flagDtoSchema,
  type SupervisorDTO,
  type ProjectDTO,
  type ReaderDTO,
  type StudentDTO,
} from "@/dto";

import { type ExtendedReaderPreferenceType } from "@/db/types";

import { ReadingPreferenceDisplay } from "@/components/reading-preference-button";
import { tagTypeSchema } from "@/components/tag/tag-input";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { AppInstanceLink } from "@/lib/routing";
import { cn } from "@/lib/utils";

export const byProjectColumns: ColumnDef<{
  project: ProjectDTO;
  supervisor: SupervisorDTO;
  student: StudentDTO;
  reader?: ReaderDTO;
  preferenceType?: ExtendedReaderPreferenceType;
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
    id: "supervisor",
    accessorFn: ({ supervisor }) => supervisor,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Supervisor" />
    ),
    cell: ({
      row: {
        original: { supervisor },
      },
    }) => (
      <div>
        <AppInstanceLink
          className={buttonVariants({ variant: "link" })}
          page="supervisorById"
          linkArgs={{ supervisorId: supervisor.id }}
        >
          {supervisor.name}
        </AppInstanceLink>
        <div className="ml-4 font-sm text-muted-foreground">
          {supervisor.id}
        </div>
        <div className="ml-4 text-sm text-muted-foreground">
          {supervisor.email}
        </div>
      </div>
    ),
  },
  {
    id: "student",
    accessorFn: ({ student }) => student,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Allocated Student" />
    ),
    cell: ({
      row: {
        original: { student },
      },
    }) => (
      <div>
        <AppInstanceLink
          className={buttonVariants({ variant: "link" })}
          page="studentById"
          linkArgs={{ studentId: student.id }}
        >
          {student.name}
        </AppInstanceLink>
        <div className="ml-4 font-sm text-muted-foreground">{student.id}</div>
        <div className="ml-4 text-sm text-muted-foreground">
          {student.email}
        </div>
      </div>
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
    id: "reader",
    accessorFn: ({ reader }) => reader,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reader" />
    ),
    cell: ({
      row: {
        original: { reader },
      },
    }) =>
      reader === undefined ? (
        <div />
      ) : (
        <div>
          <AppInstanceLink
            className={buttonVariants({ variant: "link" })}
            page="readerById"
            linkArgs={{ readerId: reader.id }}
          >
            {reader.name}
          </AppInstanceLink>
          <div className="ml-4 font-sm text-muted-foreground">{reader.id}</div>
          <div className="ml-4 text-sm text-muted-foreground">
            {reader.email}
          </div>
        </div>
      ),
  },
  {
    id: "prefType",
    accessorFn: ({ preferenceType }) => preferenceType,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Preference Type" />
    ),
    cell: ({
      row: {
        original: { preferenceType },
      },
    }) =>
      preferenceType === undefined ? (
        <div />
      ) : (
        <div>
          <ReadingPreferenceDisplay currentPreference={preferenceType} />
        </div>
      ),
  },
];
