import { type ColumnDef } from "@tanstack/react-table";
import {
  CornerDownRightIcon,
  LucideMoreHorizontal as MoreIcon,
  PenIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";

import { INSTITUTION } from "@/config/institution";
import { PAGES } from "@/config/pages";

import { type ReaderDTO } from "@/dto";

import { Role, Stage } from "@/db/types";

import { ConditionalRender } from "@/components/access-control";
import { FormatDenials } from "@/components/access-control/format-denial";
import {
  useInstanceStage,
  usePathInInstance,
} from "@/components/params-context";
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

import { stageLte } from "@/lib/utils/permissions/stage-check";

export function useAllReadersColumns({
  roles,
  deleteReader,
  deleteSelectedReaders,
}: {
  roles: Set<Role>;
  deleteReader: (id: string) => Promise<void>;
  deleteSelectedReaders: (ids: string[]) => Promise<void>;
}): ColumnDef<ReaderDTO>[] {
  const stage = useInstanceStage();
  const { getInstancePath } = usePathInInstance();

  const selectCol = getSelectColumn<ReaderDTO>();

  const userCols: ColumnDef<ReaderDTO>[] = [
    {
      id: INSTITUTION.ID_NAME,
      accessorFn: (s) => s.id,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={INSTITUTION.ID_NAME} />
      ),
      cell: ({ row: { original: reader } }) => (
        <WithTooltip
          align="start"
          tip={<div className="max-w-xs">{reader.id}</div>}
        >
          <div className="w-40 truncate">{reader.id}</div>
        </WithTooltip>
      ),
    },
    {
      id: "Name",
      accessorFn: (s) => s.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row: { original: reader } }) => (
        <Link
          className={buttonVariants({ variant: "link" })}
          href={getInstancePath([PAGES.allReaders.href, reader.id])}
        >
          {reader.name}
        </Link>
      ),
    },
    {
      id: "Email",
      accessorFn: (s) => s.email,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      id: "Workload Quota",
      accessorFn: (s) => s.workloadQuota,
      header: ({ column }) => (
        <DataTableColumnHeader
          className="w-24"
          column={column}
          title="Workload Quota"
        />
      ),
      cell: ({ row: { original: s } }) => (
        <p className="w-24 text-center">{s.workloadQuota}</p>
      ),
    },
  ];

  const actionsCol: ColumnDef<ReaderDTO> = {
    accessorKey: "actions",
    id: "Actions",
    header: ({ table }) => {
      const someSelected =
        table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected();

      const selectedReaderIds = table
        .getSelectedRowModel()
        .rows.map((e) => e.original.id);

      if (
        someSelected &&
        roles.has(Role.ADMIN) &&
        stage === Stage.READER_BIDDING
      )
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
                action={async () =>
                  void deleteSelectedReaders(selectedReaderIds).then(() =>
                    table.toggleAllRowsSelected(false),
                  )
                }
                title="Remove Readers?"
                description={
                  selectedReaderIds.length === 1
                    ? // TODO: use reader name instead of "1"
                      `you are about to remove 1 reader from the list. Do you wish to proceed?`
                    : `You are about to remove ${selectedReaderIds.length} readers from the list. Do you wish to proceed?`
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
                          <span>
                            Remove {selectedReaderIds.length} selected Readers
                          </span>
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
    cell: ({ row: { original: reader } }) => (
      <div className="flex w-14 items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <span className="sr-only">Open menu</span>
              <MoreIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <YesNoActionContainer
            action={async () => void deleteReader(reader.id)}
            title="Remove Reader?"
            description={`You are about to remove "${reader.name}" from the reader list. Do you wish to proceed?`}
          >
            <DropdownMenuContent align="center" side="bottom">
              <DropdownMenuLabel>
                Actions
                <span className="ml-2 text-muted-foreground">
                  for {reader.name}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="group/item">
                <Link
                  className="flex items-center gap-2 text-primary underline-offset-4 group-hover/item:underline hover:underline"
                  href={getInstancePath([PAGES.allReaders.href, reader.id])}
                >
                  <CornerDownRightIcon className="h-4 w-4" />
                  <span>View reader details</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="group/item">
                <Link
                  className="flex items-center gap-2 text-primary underline-offset-4 group-hover/item:underline hover:underline"
                  href={getInstancePath(
                    [PAGES.allReaders.href, reader.id],
                    "edit=true",
                  )}
                >
                  <PenIcon className="h-4 w-4" />
                  <span>Edit reader details</span>
                </Link>
              </DropdownMenuItem>
              <ConditionalRender
                allowedStages={[Stage.READER_BIDDING]}
                allowed={
                  <DropdownMenuItem className="group/item2 text-destructive focus:bg-red-100/40 focus:text-destructive">
                    <YesNoActionTrigger
                      trigger={
                        <button className="flex items-center gap-2">
                          <Trash2Icon className="h-4 w-4" />
                          <span>Remove from Instance</span>
                        </button>
                      }
                    />
                  </DropdownMenuItem>
                }
                denied={(denialData) => (
                  <WithTooltip
                    forDisabled
                    tip={
                      <FormatDenials
                        {...denialData}
                        action="Removing readers"
                      />
                    }
                  >
                    <DropdownMenuItem
                      className="group/item2 text-destructive focus:bg-red-100/40 focus:text-destructive"
                      disabled
                    >
                      <button className="flex items-center gap-2">
                        <Trash2Icon className="h-4 w-4" />
                        <span>Remove from Instance</span>
                      </button>
                    </DropdownMenuItem>
                  </WithTooltip>
                )}
              />
            </DropdownMenuContent>
          </YesNoActionContainer>
        </DropdownMenu>
      </div>
    ),
  };

  if (!roles.has(Role.ADMIN)) return userCols;

  return stageLte(stage, Stage.READER_BIDDING)
    ? [selectCol, ...userCols, actionsCol]
    : [...userCols, actionsCol];
}
