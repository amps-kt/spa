"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { SquareArrowOutUpRightIcon } from "lucide-react";

import {
  type ProjectDTO,
  type StudentDTO,
  type UnitOfAssessmentDTO,
} from "@/dto";
import {
  type StudentGradingLifecycleState,
  type UnitGradingLifecycleState,
} from "@/dto/marking";

import { type MarkerType } from "@/db/types";

import { RoleBadge } from "@/components/role-badge";
import { StudentGradingLifecycleBadge } from "@/components/ui/badges/student-grading-lifecycle-badge";
import { buttonVariants } from "@/components/ui/button";
import { ActionColumnLabel } from "@/components/ui/data-table/action-column-label";
import { ExpandingCell } from "@/components/ui/data-table/cells/expanding-cell";
import { FlagCell } from "@/components/ui/data-table/cells/flag-cell";
import { StudentCell } from "@/components/ui/data-table/cells/student-cell";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { AppInstanceLink } from "@/lib/routing";

export type MarkingStatusRow = {
  project: ProjectDTO;
  student: StudentDTO;
  role: MarkerType;
  status: StudentGradingLifecycleState;
  units: { unit: UnitOfAssessmentDTO; status: UnitGradingLifecycleState }[];
};

export const columns: ColumnDef<MarkingStatusRow>[] = [
  {
    id: "student",
    accessorFn: ({ student: { email, id, name } }) => `${name}${email}${id}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student" />
    ),
    cell: ({ row }) => <StudentCell student={row.original.student} />,
  },

  {
    id: "flag",
    accessorFn: (x) => x.student.flag.displayName,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Flag" />
    ),
    cell: ({ row }) => <FlagCell flag={row.original.student.flag} />,
  },
  {
    id: "role",
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acting as" />
    ),
    cell: ({ row }) => <RoleBadge role={row.original.role} />,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <StudentGradingLifecycleBadge status={row.original.status} />
    ),
  },
  {
    id: "actions",
    header: () => <ActionColumnLabel />,
    cell: ({ row }) => (
      <div className="flex flex-row gap-2">
        <WithTooltip tip="Go to marksheet">
          <div>
            <AppInstanceLink
              className={buttonVariants({ variant: "ghost" })}
              page="marksheet"
              linkArgs={{ studentId: row.original.student.id }}
            >
              <SquareArrowOutUpRightIcon className="size-4" />
            </AppInstanceLink>
          </div>
        </WithTooltip>
        <ExpandingCell row={row} />
      </div>
    ),
  },
];
