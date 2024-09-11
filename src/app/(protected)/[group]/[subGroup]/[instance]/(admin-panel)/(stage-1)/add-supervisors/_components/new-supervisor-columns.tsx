"use client";
import { Stage } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import {
  CornerDownRightIcon,
  MoreHorizontal as MoreIcon,
  PenIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";

import { AccessControl } from "@/components/access-control";
import { useInstanceStage } from "@/components/params-context";
import { Button } from "@/components/ui/button";
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

import { NewSupervisor } from "@/lib/validations/add-users/new-user";

export function useNewSupervisorColumns({
  removeSupervisor,
  removeSelectedSupervisors,
}: {
  removeSupervisor: (id: string) => Promise<void>;
  removeSelectedSupervisors: (ids: string[]) => Promise<void>;
}): ColumnDef<NewSupervisor>[] {
  const stage = useInstanceStage();

  const selectCol = getSelectColumn<NewSupervisor>();

  const userCols: ColumnDef<NewSupervisor>[] = [
    {
      id: "Full Name",
      accessorFn: ({ fullName }) => fullName,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Full Name" />
      ),
      cell: ({
        row: {
          original: { fullName },
        },
      }) => (
        <WithTooltip
          align="start"
          tip={<div className="max-w-xs">{fullName}</div>}
        >
          <div className="w-40 truncate">{fullName}</div>
        </WithTooltip>
      ),
    },
    {
      id: "GUID",
      accessorFn: ({ institutionId }) => institutionId,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="GUID" canFilter />
      ),
      cell: ({
        row: {
          original: { institutionId: guid },
        },
      }) => (
        <WithTooltip align="start" tip={<div className="max-w-xs">{guid}</div>}>
          <div className="w-32 truncate">{guid}</div>
        </WithTooltip>
      ),
    },
    {
      id: "Email",
      accessorFn: ({ email }) => email,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      id: "Target",
      accessorFn: ({ projectTarget }) => projectTarget,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Target" />
      ),
      cell: ({
        row: {
          original: { projectTarget },
        },
      }) => <div className="text-center">{projectTarget}</div>,
    },
    {
      id: "Upper Quota",
      accessorFn: ({ projectUpperQuota }) => projectUpperQuota,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Upper Quota" />
      ),
      cell: ({
        row: {
          original: { projectUpperQuota },
        },
      }) => <div className="text-center">{projectUpperQuota}</div>,
    },
    {
      accessorKey: "actions",
      id: "Actions",
      header: ({ table }) => {
        const someSelected =
          table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected();

        const selectedSupervisorIds = table
          .getSelectedRowModel()
          .rows.map((e) => e.original.institutionId);

        function handleRemoveSelectedSupervisors() {
          void removeSelectedSupervisors(selectedSupervisorIds).then(() =>
            table.toggleAllRowsSelected(false),
          );
        }

        if (someSelected && stage === Stage.SETUP)
          return (
            <div className="flex w-14 items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <span className="sr-only">Open menu</span>
                    <MoreIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <YesNoActionContainer
                  action={handleRemoveSelectedSupervisors}
                  title="Remove Supervisors?"
                  description={
                    selectedSupervisorIds.length === 1
                      ? `you are about to remove 1 supervisor from the list. Do you wish to proceed?`
                      : `You are about to remove ${selectedSupervisorIds.length} supervisors from the list. Do you wish to proceed?`
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
                            <span>Remove selected Supervisors</span>
                          </button>
                        }
                      />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </YesNoActionContainer>
              </DropdownMenu>
            </div>
          );

        return <ActionColumnLabel />;
      },
      cell: ({
        row: {
          original: { fullName, institutionId },
        },
      }) => (
        <div className="flex w-14 items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <span className="sr-only">Open menu</span>
                <MoreIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <YesNoActionContainer
              action={async () => void removeSupervisor(institutionId)}
              title="Remove Supervisor?"
              description={`You are about to remove "${fullName}" from the supervisor list. Do you wish to proceed?`}
            >
              <DropdownMenuContent align="center" side="bottom">
                <DropdownMenuLabel>
                  Actions
                  <span className="ml-2 text-muted-foreground">
                    for {fullName}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="group/item">
                  <Link
                    className="flex items-center gap-2 text-primary underline-offset-4 group-hover/item:underline hover:underline"
                    href={`./supervisors/${institutionId}`}
                  >
                    <CornerDownRightIcon className="h-4 w-4" />
                    <span>View supervisor details</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="group/item">
                  <Link
                    className="flex items-center gap-2 text-primary underline-offset-4 group-hover/item:underline hover:underline"
                    href={`./supervisors/${institutionId}?edit=true`}
                  >
                    <PenIcon className="h-4 w-4" />
                    <span>Edit supervisor details</span>
                  </Link>
                </DropdownMenuItem>
                <AccessControl allowedStages={[Stage.SETUP]}>
                  <DropdownMenuItem className="text-destructive focus:bg-red-100/40 focus:text-destructive">
                    <YesNoActionTrigger
                      trigger={
                        <button className="flex items-center gap-2">
                          <Trash2Icon className="h-4 w-4" />
                          <span>Remove from Instance</span>
                        </button>
                      }
                    />
                  </DropdownMenuItem>
                </AccessControl>
              </DropdownMenuContent>
            </YesNoActionContainer>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return [selectCol, ...userCols];
}
