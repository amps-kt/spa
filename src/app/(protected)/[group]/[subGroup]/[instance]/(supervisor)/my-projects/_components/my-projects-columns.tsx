import { Stage } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal as MoreIcon, PenIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";

import { useInstancePath, useInstanceStage } from "@/components/params-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { ActionColumnLabel } from "@/components/ui/data-table/action-column-label";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { getSelectColumn } from "@/components/ui/data-table/select-column";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";
import {
  YesNoActionContainer,
  YesNoActionTrigger,
} from "@/components/yes-no-action";

import { stageGt } from "@/lib/utils/permissions/stage-check";

export type SupervisorProjectDataDto = {
  id: string;
  title: string;
  capacityUpperBound: number;
  allocatedStudentName?: string;
  allocatedStudentId?: string;
};

export function useMyProjectColumns({
  deleteProject,
  deleteSelectedProjects,
}: {
  deleteProject: (id: string) => Promise<void>;
  deleteSelectedProjects: (ids: string[]) => Promise<void>;
}): ColumnDef<SupervisorProjectDataDto>[] {
  const stage = useInstanceStage();
  const instancePath = useInstancePath();

  const selectCol = getSelectColumn<SupervisorProjectDataDto>();

  const userCols: ColumnDef<SupervisorProjectDataDto>[] = [
    {
      id: "ID",
      accessorFn: ({ id }) => id,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" canFilter />
      ),
      cell: ({ row: { original: project } }) => (
        <WithTooltip
          align="start"
          tip={<div className="max-w-xs">{project.id}</div>}
        >
          <p className="max-w-28 truncate">{project.id}</p>
        </WithTooltip>
      ),
    },
    {
      id: "Project Title",
      accessorFn: ({ title }) => title,
      header: () => (
        <div className="min-w-52 max-w-56 py-1 pl-4">Project Title</div>
      ),
      cell: ({
        row: {
          original: { id, title },
        },
      }) => (
        <div className="flex min-w-52 max-w-56 items-center justify-start">
          <Link
            className={buttonVariants({ variant: "link" })}
            href={`projects/${id}`}
          >
            <WithTooltip
              align="start"
              tip={<div className="max-w-xs">{title}</div>}
            >
              <p className="max-w-56 truncate">{title}</p>
            </WithTooltip>
          </Link>
        </div>
      ),
    },
    {
      id: "Allocated Student Name",
      accessorFn: ({ allocatedStudentName }) => allocatedStudentName,
      header: ({ column }) => (
        <DataTableColumnHeader
          className="w-36"
          column={column}
          title="Allocated Student Name"
        />
      ),
      cell: ({
        row: {
          original: { allocatedStudentName },
        },
      }) => <div className="w-36 py-1 pl-2">{allocatedStudentName}</div>,
    },
    {
      id: "Allocated Student GUID",
      accessorFn: ({ allocatedStudentId }) => allocatedStudentId,
      header: ({ column }) => (
        <div className="w-28 py-1">
          <DataTableColumnHeader
            column={column}
            title="Allocated Student GUID"
          />
        </div>
      ),
      cell: ({
        row: {
          original: { allocatedStudentId },
        },
      }) => <div className="w-28 py-1 pl-4">{allocatedStudentId}</div>,
    },
    {
      id: "Capacity Upper Bound",
      accessorFn: ({ capacityUpperBound }) => capacityUpperBound,
      header: ({ column }) => (
        <DataTableColumnHeader
          className="w-16"
          column={column}
          title="Upper Bound"
        />
      ),
      cell: ({
        row: {
          original: { capacityUpperBound },
        },
      }) => <div className="w-16 text-center">{capacityUpperBound}</div>,
    },
  ];

  const actionCol: ColumnDef<SupervisorProjectDataDto> = {
    accessorKey: "actions",
    id: "Actions",
    header: ({ table }) => {
      const someSelected =
        table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected();

      const selectedProjectIds = table
        .getSelectedRowModel()
        .rows.map((e) => e.original.id);

      async function handleDeleteSelected() {
        void deleteSelectedProjects(selectedProjectIds).then(() => {
          table.toggleAllRowsSelected(false);
        });
      }

      if (someSelected) {
        return (
          <div className="flex w-24 items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <span className="sr-only">Open menu</span>
                  <MoreIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <YesNoActionContainer
                action={handleDeleteSelected}
                title="Delete Projects?"
                description={
                  selectedProjectIds.length === 1
                    ? `You are about to delete "${selectedProjectIds[0]}". Do you wish to proceed?`
                    : `You are about to delete ${selectedProjectIds.length} projects. Do you wish to proceed?`
                }
              >
                <DropdownMenuContent align="center" side="bottom">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:bg-red-100/40 focus:text-destructive">
                    <YesNoActionTrigger
                      trigger={
                        <button className="flex items-center gap-2">
                          <Trash2Icon className="h-4 w-4" />
                          <span>Delete Selected Projects</span>
                        </button>
                      }
                    />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </YesNoActionContainer>
            </DropdownMenu>
          </div>
        );
      }
      return <ActionColumnLabel className="w-24" />;
    },
    cell: ({
      row: {
        original: { id },
      },
    }) => (
      <div className="flex w-24 items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <span className="sr-only">Open menu</span>
              <MoreIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <YesNoActionContainer
            action={() => deleteProject(id)}
            title="Delete Project?"
            description={`You are about to delete project ${id}. Do you wish to proceed?`}
          >
            <DropdownMenuContent align="center" side="bottom">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link
                  className="flex items-center gap-2 text-primary underline-offset-4 group-hover/item:underline hover:underline"
                  href={`${instancePath}/projects/${id}/edit`}
                >
                  <PenIcon className="h-4 w-4" />
                  <span>Edit Project {id}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:bg-red-100/40 focus:text-destructive">
                <YesNoActionTrigger
                  trigger={
                    <button className="flex items-center gap-2">
                      <Trash2Icon className="h-4 w-4" />
                      <span>Delete Project {id}</span>
                    </button>
                  }
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </YesNoActionContainer>
        </DropdownMenu>
      </div>
    ),
  };

  if (stageGt(stage, Stage.PROJECT_SUBMISSION)) return userCols;
  return [selectCol, ...userCols, actionCol];
}
