import { type ColumnDef } from "@tanstack/react-table";
import {
  CopyIcon,
  CornerDownRightIcon,
  FilePlus2Icon,
  MoreHorizontalIcon as MoreIcon,
  PenIcon,
} from "lucide-react";

import { type SupervisorDTO } from "@/dto";

import { ExportCSVButton } from "@/components/export-csv";
import { CircleCheckSolidIcon } from "@/components/icons/circle-check";
import { CircleXIcon } from "@/components/icons/circle-x";
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

import { AppInstanceLink } from "@/lib/routing";
import { copyToClipboard } from "@/lib/utils/copy-to-clipboard";

type ProjectSubmissionDto = {
  supervisor: SupervisorDTO;
  submittedProjectsCount: number;
  submissionTarget: number;
  targetMet: boolean;
};

export function useProjectSubmissionColumns(): ColumnDef<ProjectSubmissionDto>[] {
  const selectCol = getSelectColumn<ProjectSubmissionDto>();

  const baseCols: ColumnDef<ProjectSubmissionDto>[] = [
    {
      id: "Name",
      accessorFn: (s) => s.supervisor.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({
        row: {
          original: { supervisor },
        },
      }) => (
        <AppInstanceLink
          className={buttonVariants({ variant: "link" })}
          page="supervisorById"
          linkArgs={{ supervisorId: supervisor.id }}
        >
          {supervisor.name}
        </AppInstanceLink>
      ),
    },
    {
      id: "Email",
      accessorFn: (s) => s.supervisor.email,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      id: "Already Submitted",
      accessorFn: (s) => s.submittedProjectsCount,
      header: ({ column }) => (
        <DataTableColumnHeader
          className="w-28"
          column={column}
          title="Already Submitted"
        />
      ),
      cell: ({
        row: {
          original: { submittedProjectsCount },
        },
      }) => <p className="w-full text-center">{submittedProjectsCount}</p>,
      footer: ({ table }) => {
        const rows = table.getCoreRowModel().rows;

        const count = rows.reduce(
          (acc, { original: r }) => acc + r.submittedProjectsCount,
          0,
        );

        const supervisorsWithSubmissions = rows.reduce(
          (acc, { original: r }) =>
            r.submittedProjectsCount > 0 ? acc + 1 : acc,
          0,
        );

        return (
          <WithTooltip
            tip={
              <p>
                {count} projects have been submitted by{" "}
                {supervisorsWithSubmissions} supervisors
              </p>
            }
          >
            <p className="w-full text-center">
              Total:{" "}
              <span className="underline decoration-slate-400 decoration-dotted underline-offset-2">
                {count}
              </span>
            </p>
          </WithTooltip>
        );
      },
    },
    {
      id: "Submission Target",
      accessorFn: (s) => s.submissionTarget,
      header: ({ column }) => (
        <DataTableColumnHeader
          className="w-28"
          column={column}
          title="Submission Target"
        />
      ),
      cell: ({
        row: {
          original: { submissionTarget },
        },
      }) => <p className="w-full text-center">{submissionTarget}</p>,
      footer: ({ table }) => {
        const rows = table.getCoreRowModel().rows;
        const count = rows.reduce(
          (acc, { original: r }) =>
            r.submittedProjectsCount >= r.submissionTarget ? acc + 1 : acc,
          0,
        );
        return (
          <WithTooltip
            tip={
              <p>
                {count} of {rows.length} supervisors have met their submission
                target
              </p>
            }
          >
            <p className="w-full text-center">
              Met Target:{" "}
              <span className="underline decoration-slate-400 decoration-dotted underline-offset-2">
                {count} / {rows.length}
              </span>
            </p>
          </WithTooltip>
        );
      },
    },
    {
      id: "Target Met",
      accessorFn: (s) => s.targetMet,
      header: "Target Met",
      cell: ({
        row: {
          original: { targetMet },
        },
      }) => (
        <div className="flex items-center justify-center">
          {targetMet ? (
            <CircleCheckSolidIcon className="h-4 w-4 fill-green-500" />
          ) : (
            <CircleXIcon className="h-4 w-4 fill-destructive" />
          )}
        </div>
      ),
      filterFn: (row, columnId, value) => {
        const selectedFilters = value as ("yes" | "no")[];
        const rowValue = row.getValue(columnId);
        const targetMet = rowValue ? "yes" : "no";
        return selectedFilters.includes(targetMet);
      },
    },
    {
      accessorKey: "actions",
      id: "Actions",
      header: ({ table }) => {
        const someSelected =
          table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected();

        const data = table
          .getSelectedRowModel()
          .rows.map(({ original: r }) => [
            r.supervisor.name,
            r.supervisor.email,
            r.submittedProjectsCount,
            r.submissionTarget,
            r.targetMet ? 1 : 0,
          ]);

        if (someSelected)
          return (
            <div className="flex w-14 items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <span className="sr-only">Open menu</span>
                    <MoreIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" side="bottom">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2 text-primary">
                    <ExportCSVButton
                      filename="project-submissions"
                      text="Download selected rows"
                      header={[
                        "Name",
                        "Email",
                        "Already Submitted",
                        "Submission Target",
                        "Target Met",
                      ]}
                      data={data}
                    />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );

        return <ActionColumnLabel />;
      },
      cell: ({
        row: {
          original: { supervisor },
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
            <DropdownMenuContent align="center" side="bottom">
              <DropdownMenuLabel>
                Actions
                <span className="ml-2 text-muted-foreground">
                  for {supervisor.name}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="group/item">
                <AppInstanceLink
                  className="flex items-center gap-2 text-primary underline-offset-4 group-hover/item:underline hover:underline"
                  page="supervisorById"
                  linkArgs={{ supervisorId: supervisor.id }}
                >
                  <CornerDownRightIcon className="h-4 w-4" />
                  <span>View supervisor details</span>
                </AppInstanceLink>
              </DropdownMenuItem>
              <DropdownMenuItem className="group/item">
                <AppInstanceLink
                  className="flex items-center gap-2 text-primary underline-offset-4 group-hover/item:underline hover:underline"
                  page="supervisorById"
                  linkArgs={{ supervisorId: supervisor.id }}
                >
                  <PenIcon className="h-4 w-4" />
                  <span>Edit supervisor details</span>
                </AppInstanceLink>
              </DropdownMenuItem>
              <DropdownMenuItem className="group/item">
                <button
                  className="flex items-center gap-2 text-sm text-primary underline-offset-4 group-hover/item:underline hover:underline"
                  onClick={async () => await copyToClipboard(supervisor.email)}
                >
                  <CopyIcon className="h-4 w-4" />
                  <span>Copy email</span>
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem className="group/item">
                <AppInstanceLink
                  className="flex items-center gap-2 text-primary underline-offset-4 group-hover/item:underline hover:underline"
                  page="newSupervisorProject"
                  linkArgs={{ supervisorId: supervisor.id }}
                >
                  <FilePlus2Icon className="h-4 w-4" />
                  <span>Create new project</span>
                </AppInstanceLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
  return [selectCol, ...baseCols];
}
