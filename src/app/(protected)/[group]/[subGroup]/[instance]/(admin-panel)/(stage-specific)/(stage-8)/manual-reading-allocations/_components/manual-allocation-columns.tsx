"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { RotateCcwIcon, SaveIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { z } from "zod";

import { PAGES } from "@/config/pages";

import { usePathInInstance } from "@/components/params-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { cn } from "@/lib/utils";

import {
  type ManualReadingAllocationRow,
  type ManualReadingAllocationReader,
} from "./manual-allocation-types";
import { ReaderCombobox } from "./reader-combobox";

type ManualReadingAllocationColumnsProps = {
  readers: ManualReadingAllocationReader[];
  onUpdateAllocation: (
    projectId: string,
    { readerId }: { readerId?: string },
  ) => void;
  onRemoveAllocation: (projectId: string) => void;
  onSave: (projectId: string) => Promise<void>;
  onReset: (projectId: string) => void;
};

export function useManualReadingAllocationColumns({
  readers,
  onUpdateAllocation,
  onRemoveAllocation,
  onSave,
  onReset,
}: ManualReadingAllocationColumnsProps): ColumnDef<ManualReadingAllocationRow>[] {
  const { getPath } = usePathInInstance();
  return [
    {
      id: "project",
      accessorFn: (row) =>
        `${row.project.title} ${row.project.supervisor.name}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Project" />
      ),
      cell: ({ row }) => {
        const projectData = row.original;
        return (
          <div className="space-y-2">
            <Link
              href={getPath(
                `${PAGES.allProjects.href}/${projectData.project.id}`,
              )}
              className={cn(
                buttonVariants({ variant: "link" }),
                "p-0 text-sm font-medium",
              )}
            >
              {projectData.project.title}
            </Link>
            <Link
              href={getPath(
                `${PAGES.allSupervisors.href}/${projectData.project.supervisorId}`,
              )}
              className={cn(
                buttonVariants({ variant: "link" }),
                "p-0 text-xs text-muted-foreground",
              )}
            >
              {projectData.project.supervisor.name}
            </Link>
          </div>
        );
      },
      filterFn: (row, _, value) => {
        const searchValue = z.string().parse(value).toLowerCase();
        const projectData = row.original;
        return projectData.project.title.toLowerCase().includes(searchValue);
      },
    },

    {
      id: "Flags",
      accessorFn: (row) => row.student.flag.id,
      header: () => null,
      cell: () => null,
      filterFn: (row, columnId, value) => {
        const selectedFilters = z.array(z.string()).parse(value);
        return selectedFilters.includes(row.getValue<string>(columnId));
      },
    },

    {
      id: "reader",
      accessorFn: (row) =>
        readers.find(
          (reader) =>
            reader.id === (row.selectedReaderId ?? row.originalReaderId),
        )?.name ?? "",
      header: "Reader",
      cell: ({ row }) => {
        const projectData = row.original;
        return (
          <ReaderCombobox
            readers={readers}
            value={projectData.selectedReaderId ?? projectData.originalReaderId}
            excludeReaderId={projectData.project.supervisorId}
            onValueChange={(value) =>
              onUpdateAllocation(projectData.project.id, {
                readerId: value ?? undefined,
              })
            }
          />
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: true,
      cell: ({ row: { original: projectData } }) => (
        <div>
          <div className="flex items-center gap-2">
            <WithTooltip tip="Reset">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReset(projectData.project.id)}
                disabled={!projectData.isDirty}
                className="h-8 w-8 p-0 "
              >
                <RotateCcwIcon className="h-3 w-3" />
              </Button>
            </WithTooltip>
            <WithTooltip tip="Save">
              <Button
                size="sm"
                onClick={() => onSave(projectData.project.id)}
                disabled={!projectData.isDirty}
                className={cn(
                  "h-8 w-8 bg-muted p-0 text-muted-foreground",
                  projectData.isDirty && "bg-primary text-primary-foreground",
                )}
              >
                <SaveIcon className="h-3 w-3" />
              </Button>
            </WithTooltip>
            <WithTooltip tip="Un-allocate">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onRemoveAllocation(projectData.project.id)}
                disabled={projectData.originalReaderId === undefined}
                className={cn(
                  "h-8 w-8 p-0",
                  projectData.originalReaderId === undefined &&
                    "bg-muted text-muted-foreground",
                )}
              >
                <Trash2Icon className="h-3 w-3" />
              </Button>
            </WithTooltip>
          </div>
          {projectData.isDirty && (
            <div className="mr-2 mt-3 flex items-center justify-center gap-1">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-xs font-medium text-blue-700">Pending</span>
            </div>
          )}
        </div>
      ),
    },
  ];
}
