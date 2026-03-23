import { type ColumnDef } from "@tanstack/react-table";
import {
  CornerDownRightIcon,
  MoreHorizontalIcon as MoreIcon,
  PenIcon,
  Trash2Icon,
} from "lucide-react";
import { z } from "zod";

import { INSTITUTION } from "@/config/institution";

import {
  flagDtoSchema,
  type ProjectDTO,
  type StudentDTO,
  type SupervisorDTO,
} from "@/dto";

import { tagTypeSchema } from "@/components/tag/tag-input";
import { Badge, badgeVariants } from "@/components/ui/badge";
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

import { AppInstanceLink } from "@/lib/routing";
import { cn } from "@/lib/utils";

type PreAllocation = {
  project: ProjectDTO;
  supervisor: SupervisorDTO;
  student: StudentDTO;
};

export function usePreAllocatedProjectColumns({
  deleteProject,
  deleteSelectedProjects,
}: {
  deleteProject: (id: string) => Promise<void>;
  deleteSelectedProjects: (ids: string[]) => Promise<void>;
}): ColumnDef<PreAllocation>[] {
  const selectCol = getSelectColumn<PreAllocation>();

  const userCols: ColumnDef<PreAllocation>[] = [
    {
      id: "ID",
      accessorFn: ({ project }) => project.id,
      header: ({ column }) => (
        <DataTableColumnHeader className="w-24" column={column} title="ID" />
      ),
      cell: ({
        row: {
          original: { project },
        },
      }) => (
        <WithTooltip
          align="start"
          tip={<div className="max-w-xs">{project.id}</div>}
        >
          <p className="w-24 truncate">{project.id}</p>
        </WithTooltip>
      ),
    },
    {
      id: "Project Title",
      accessorFn: ({ project }) => project.title,
      header: () => <div className="min-w-40 py-1 pl-4">Project Title</div>,
      cell: ({
        row: {
          original: { project },
        },
      }) => (
        <WithTooltip tip={<p className="max-w-96">{project.title}</p>}>
          <AppInstanceLink
            className={cn(
              buttonVariants({ variant: "link" }),
              "inline-block w-40 truncate px-0 text-start",
            )}
            page="projectById"
            linkArgs={{ projectId: project.id }}
          >
            {project.title}
          </AppInstanceLink>
        </WithTooltip>
      ),
    },
    {
      id: `Supervisor ${INSTITUTION.ID_NAME}`,
      accessorFn: ({ supervisor }) => supervisor.id,
      header: ({ column }) => (
        <div className="w-28 py-1">
          <DataTableColumnHeader
            column={column}
            title={`Supervisor ${INSTITUTION.ID_NAME}`}
          />
        </div>
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
          {supervisor.id}
        </AppInstanceLink>
      ),
    },
    {
      id: "Flags",
      accessorFn: ({ project }) => project.flags,
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
          original: {
            project: { flags },
          },
        },
      }) => (
        <div className="flex flex-col gap-2">
          {flags.length > 2 ? (
            <>
              <Badge
                variant="accent"
                className="w-40 rounded-md"
                key={flags[0].id}
              >
                {flags[0].displayName}
              </Badge>
              <WithTooltip
                side="right"
                tip={
                  <ul className="flex list-disc flex-col gap-1 p-2 pl-1">
                    {flags.slice(1).map((flag) => (
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
                  {flags.length - 1}+
                </div>
              </WithTooltip>
            </>
          ) : (
            flags.map((flag) => (
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
      accessorFn: ({ project }) => project.tags,
      header: () => <div className="text-center">Keywords</div>,
      filterFn: (row, columnId, value) => {
        const ids = value as string[];
        const rowTags = z.array(tagTypeSchema).parse(row.getValue(columnId));
        return rowTags.some((e) => ids.includes(e.id));
      },
      cell: ({
        row: {
          original: {
            project: { tags },
          },
        },
      }) => (
        <div className="flex flex-col gap-2">
          {tags.length > 2 ? (
            <>
              <Badge variant="outline" className="w-fit" key={tags[0].id}>
                {tags[0].title}
              </Badge>
              <WithTooltip
                side="right"
                tip={
                  <ul className="flex list-disc flex-col gap-1 p-2 pl-1">
                    {tags.slice(1).map((tag) => (
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
                  {tags.length - 1}+
                </div>
              </WithTooltip>
            </>
          ) : (
            tags.map((tag) => (
              <Badge variant="outline" className="w-fit" key={tag.id}>
                {tag.title}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      accessorFn: (p) => p.student.id,
      id: `Student ${INSTITUTION.ID_NAME}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          className="w-20"
          column={column}
          title={`Student ${INSTITUTION.ID_NAME}`}
        />
      ),
      cell: ({
        row: {
          original: { student },
        },
      }) => (
        <AppInstanceLink
          className={buttonVariants({ variant: "link" })}
          page="studentById"
          linkArgs={{ studentId: student.id }}
        >
          {student.id}
        </AppInstanceLink>
      ),
    },
    {
      accessorKey: "actions",
      id: "Actions",
      header: ({ table }) => {
        const someSelected =
          table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected();

        const selectedProjectIds = table
          .getSelectedRowModel()
          .rows.map((e) => e.original.project.id);

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
          original: { project },
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
              action={() => deleteProject(project.id)}
              title="Delete Project?"
              description={`You are about to delete project ${project.id}. Do you wish to proceed?`}
            >
              <DropdownMenuContent align="center" side="bottom">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="group/item">
                  <AppInstanceLink
                    className="flex items-center gap-2 text-primary underline-offset-4 group-hover/item:underline hover:underline"
                    page="projectById"
                    linkArgs={{ projectId: project.id }}
                  >
                    <CornerDownRightIcon className="h-4 w-4" />
                    <p className="flex items-center">
                      View &quot;
                      <p className="max-w-40 truncate">{project.title}</p>
                      &quot;
                    </p>
                  </AppInstanceLink>
                </DropdownMenuItem>
                <DropdownMenuItem className="group/item">
                  <AppInstanceLink
                    className="flex items-center gap-2 text-primary underline-offset-4 group-hover/item:underline hover:underline"
                    page="editProject"
                    linkArgs={{ projectId: project.id }}
                  >
                    <PenIcon className="h-4 w-4" />
                    <span>Edit Project details</span>
                  </AppInstanceLink>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:bg-red-100/40 focus:text-destructive">
                  <YesNoActionTrigger
                    trigger={
                      <button className="flex items-center gap-2">
                        <Trash2Icon className="h-4 w-4" />
                        <span>Delete Project</span>
                      </button>
                    }
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </YesNoActionContainer>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return [selectCol, ...userCols];
}
