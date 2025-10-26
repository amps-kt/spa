"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ShuffleIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { z } from "zod";

import { PAGES } from "@/config/pages";

import { type ProjectDTO, type StudentDTO } from "@/dto";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { cn } from "@/lib/utils";

type RandomAllocationDTO = { student: StudentDTO; project?: ProjectDTO };

export function useRandomAllocationColumns({
  getRandomAllocation,
  getRandomAllocationForAll,
  removeAllocation,
}: {
  getRandomAllocation: (studentId: string) => Promise<void>;
  getRandomAllocationForAll: () => Promise<void>;
  removeAllocation: (studentId: string) => Promise<void>;
}): ColumnDef<RandomAllocationDTO>[] {
  const columns: ColumnDef<RandomAllocationDTO>[] = [
    {
      id: "Random Allocation",
      header: () => {
        return (
          <WithTooltip tip="Randomly allocate a project to all student">
            <Button
              size="icon"
              variant="outline"
              onClick={async () => void getRandomAllocationForAll()}
            >
              <ShuffleIcon className="h-4 w-4" />
            </Button>
          </WithTooltip>
        );
      },
      cell: ({
        row: {
          original: { student },
        },
      }) => {
        return (
          <WithTooltip tip="Randomly allocate a project to this student">
            <Button
              size="icon"
              variant="outline"
              onClick={async () => void getRandomAllocation(student.id)}
            >
              <ShuffleIcon className="h-4 w-4" />
            </Button>
          </WithTooltip>
        );
      },
    },
    {
      id: "Student",
      accessorFn: (s) => `${s.student.name} ${s.student.id}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Student" />
      ),
      cell: ({
        row: {
          original: { student },
        },
      }) => (
        <div className="flex flex-col gap-2 items-start">
          <Link
            className={buttonVariants({ variant: "link" })}
            href={`./${PAGES.allStudents.href}/${student.id}`}
          >
            {student.name}
          </Link>
          <p className="font-mono text-muted-foreground ml-4">{student.id}</p>
        </div>
      ),
    },
    {
      id: "Flag",
      accessorFn: ({ student }) => student.flag.displayName,
      header: ({ column }) => (
        <DataTableColumnHeader className="w-20" column={column} title="Flag" />
      ),
      cell: ({
        row: {
          original: { student },
        },
      }) => (
        <div className="grid w-40 place-items-center">
          <Badge variant="accent" className="rounded-md">
            {student.flag.displayName}
          </Badge>
        </div>
      ),
      filterFn: (row, columnId, value) => {
        const selectedFilters = z.array(z.string()).parse(value);
        return selectedFilters.includes(row.getValue<string>(columnId));
      },
    },
    {
      id: "Allocated Project",
      accessorFn: (a) => a.student.name,
      header: () => <p className="text-wrap py-2">Allocated Project</p>,
      cell: ({
        row: {
          original: { project },
        },
      }) => {
        if (project) {
          return (
            <Link
              className={cn(
                buttonVariants({ variant: "link" }),
                "line-clamp-3 inline-block h-max pl-2 text-start",
              )}
              href={`./projects/${project.id}`}
              scroll={true}
            >
              {project.title}
            </Link>
          );
        }
      },
    },
    {
      id: "Remove Project",
      header: "",
      cell: ({
        row: {
          original: { project, student },
        },
      }) => {
        if (project) {
          return (
            <WithTooltip tip="Remove this project allocation">
              <Button
                size="icon"
                variant="destructive"
                onClick={async () => void removeAllocation(student.id)}
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </WithTooltip>
          );
        }
      },
    },
  ];

  return columns;
}
