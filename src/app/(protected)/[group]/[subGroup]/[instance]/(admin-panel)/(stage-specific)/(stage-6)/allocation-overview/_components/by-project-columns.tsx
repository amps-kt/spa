"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { INSTITUTION } from "@/config/institution";

import { Button, buttonVariants } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { AppInstanceLink } from "@/lib/routing";
import { cn } from "@/lib/utils";
import { type AllocationByProjectDto } from "@/lib/validations/allocation/data-table-dto";

export const byProjectColumns: ColumnDef<AllocationByProjectDto>[] = [
  {
    id: "Project ID",
    accessorFn: ({ project }) => project.id,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project ID" />
    ),
    cell: ({
      row: {
        original: { project },
      },
    }) => (
      <div className="text-left">
        <WithTooltip tip={project.id}>
          <Button variant="ghost" className="cursor-default">
            <div className="w-20 truncate">{project.id}</div>
          </Button>
        </WithTooltip>
      </div>
    ),
  },
  {
    id: "Project Title",
    accessorFn: ({ project }) => project.title,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project Title" />
    ),
    cell: ({
      row: {
        original: {
          project: { id, title },
        },
      },
    }) => (
      <WithTooltip tip={<p className="max-w-96">{title}</p>}>
        <AppInstanceLink
          className={cn(
            buttonVariants({ variant: "link" }),
            "inline-block w-60 truncate px-0 text-start",
          )}
          page="projectById"
          linkArgs={{ projectId: id }}
          // scroll={true}
        >
          {title}
        </AppInstanceLink>
      </WithTooltip>
    ),
  },
  {
    id: "Project Lower Bound",
    accessorFn: ({ project }) => project.capacityLowerBound,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project Lower Bound" />
    ),
    cell: ({
      row: {
        original: {
          project: { capacityLowerBound },
        },
      },
    }) => <div className="flex justify-center">{capacityLowerBound}</div>,
  },
  {
    id: "Project Upper Bound",
    accessorFn: ({ project }) => project.capacityUpperBound,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project Upper Bound" />
    ),
    cell: ({
      row: {
        original: {
          project: { capacityUpperBound },
        },
      },
    }) => <div className="flex justify-center">{capacityUpperBound}</div>,
  },

  {
    id: "Supervisor Name",
    accessorFn: ({ supervisor }) => supervisor.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Supervisor Name" />
    ),
    cell: ({
      row: {
        original: {
          supervisor: { id, name },
        },
      },
    }) => (
      <AppInstanceLink
        className={cn(buttonVariants({ variant: "link" }), "pl-0 text-left")}
        page="supervisorById"
        linkArgs={{ supervisorId: id }}
        // scroll={true}
      >
        {name}
      </AppInstanceLink>
    ),
  },
  {
    id: `Student ${INSTITUTION.ID_NAME}`,
    accessorFn: ({ student }) => student.id,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={`Student ${INSTITUTION.ID_NAME}`}
      />
    ),
    cell: ({
      row: {
        original: { student },
      },
    }) => <p className="pl-3 font-medium">{student.id}</p>,
  },
  {
    id: "Student Name",
    accessorFn: ({ student }) => student.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student Name" />
    ),
    cell: ({
      row: {
        original: {
          student: { id, name },
        },
      },
    }) => (
      <AppInstanceLink
        className={cn(buttonVariants({ variant: "link" }), "pl-2 text-left")}
        page="studentById"
        linkArgs={{ studentId: id }}
        // scroll={true}
      >
        {name}
      </AppInstanceLink>
    ),
  },
  {
    id: "Student Rank",
    accessorFn: ({ student }) => student.ranking,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student Rank" />
    ),
    cell: ({
      row: {
        original: { student },
      },
    }) => <div className="flex justify-center">{student.ranking}</div>,
  },
];
