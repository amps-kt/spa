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
import { Badge } from "@/components/ui/badge";
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

import { NewStudent } from "@/lib/validations/add-users/new-user";

export function useNewStudentColumns({
  removeStudent,
  removeSelectedStudents,
}: {
  removeStudent: (id: string) => Promise<void>;
  removeSelectedStudents: (ids: string[]) => Promise<void>;
}): ColumnDef<NewStudent>[] {
  const stage = useInstanceStage();

  const selectCol = getSelectColumn<NewStudent>();

  const userCols: ColumnDef<NewStudent>[] = [
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
      accessorFn: ({ institutionId: guid }) => guid,
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
      id: "Student Level",
      accessorFn: ({ level }) => level,
      header: ({ column }) => (
        <DataTableColumnHeader
          className="w-24"
          column={column}
          title="Student Level"
        />
      ),
      cell: ({
        row: {
          original: { level },
        },
      }) => (
        <div className="grid w-24 place-items-center">
          <Badge variant="accent">{level}</Badge>
        </div>
      ),
      filterFn: (row, columnId, value) => {
        const selectedFilters = value as ("4" | "5")[];
        const rowValue = row.getValue(columnId) as 4 | 5;
        console.log({ selectedFilters });
        const studentLevel = rowValue.toString() as "4" | "5";
        return selectedFilters.includes(studentLevel);
      },
    },
    {
      accessorKey: "actions",
      id: "Actions",
      header: ({ table }) => {
        const someSelected =
          table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected();

        const selectedStudentIds = table
          .getSelectedRowModel()
          .rows.map((e) => e.original.institutionId);

        function handleRemoveSelectedStudents() {
          void removeSelectedStudents(selectedStudentIds).then(() =>
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
                  action={handleRemoveSelectedStudents}
                  title="Remove Students?"
                  description={
                    selectedStudentIds.length === 1
                      ? `You are about to remove 1 student from the list. Do you wish to proceed?`
                      : `You are about to remove ${selectedStudentIds.length} students from the list. Do you wish to proceed?`
                  }
                >
                  <DropdownMenuContent align="center" side="bottom">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:bg-red-100/40 focus:text-destructive">
                      <YesNoActionTrigger
                        trigger={
                          <button className="flex items-center gap-2 text-sm">
                            <Trash2Icon className="h-4 w-4" />
                            <span>Remove selected Students</span>
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
              action={() => void removeStudent(institutionId)}
              title="Remove Student?"
              description={`You are about to remove "${fullName}" from the student list. Do you wish to proceed?`}
            >
              <DropdownMenuContent align="center" side="bottom">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="group/item">
                  <Link
                    className="flex items-center gap-2 text-primary underline-offset-4 group-hover/item:underline hover:underline"
                    href={`./students/${institutionId}`}
                  >
                    <CornerDownRightIcon className="h-4 w-4" />
                    <span>View student details</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="group/item">
                  <Link
                    className="flex items-center gap-2 text-primary underline-offset-4 group-hover/item:underline hover:underline"
                    href={`./students/${institutionId}?edit=true`}
                  >
                    <PenIcon className="h-4 w-4" />
                    <span>Edit student details</span>
                  </Link>
                </DropdownMenuItem>
                <AccessControl allowedStages={[Stage.SETUP]}>
                  <DropdownMenuItem className="bg-background text-destructive focus:bg-red-100/40 focus:text-destructive">
                    <YesNoActionTrigger
                      trigger={
                        <button className="flex items-center gap-2 text-sm">
                          <Trash2Icon className="h-4 w-4" />
                          <span>Remove Student {fullName}</span>
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
