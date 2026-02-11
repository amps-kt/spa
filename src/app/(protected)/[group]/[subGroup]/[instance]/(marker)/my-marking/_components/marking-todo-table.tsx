"use client";

import { Fragment } from "react";

import { type ColumnDef } from "@tanstack/react-table";
import { SquareArrowOutUpRightIcon } from "lucide-react";

import {
  type ProjectDTO,
  type StudentDTO,
  type UnitOfAssessmentDTO,
} from "@/dto";
import {
  type OverallMarkingStatus,
  type UnitMarkingStatus,
} from "@/dto/marking";

import { type MarkerType } from "@/db/types";

import { OverallStatusIndicator } from "@/components/marking/overall-status-indicator";
import { UoaStatusIndicator } from "@/components/marking/uoa-status-indicator";
import { RoleBadge } from "@/components/role-badge";
import { buttonVariants } from "@/components/ui/button";
import { ActionColumnLabel } from "@/components/ui/data-table/action-column-label";
import { ExpandingCell } from "@/components/ui/data-table/cells/expanding-cell";
import { FlagCell } from "@/components/ui/data-table/cells/flag-cell";
import { StudentCell } from "@/components/ui/data-table/cells/student-cell";
import DataTable, {
  type CustomRowType,
} from "@/components/ui/data-table/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { DefaultRow } from "@/components/ui/data-table/default-row";
import { TableCell, TableRow } from "@/components/ui/table";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { AppInstanceLink } from "@/lib/routing";
import { api } from "@/lib/trpc/client";
import { type InstanceParams } from "@/lib/validations/params";

type TRow = {
  project: ProjectDTO;
  student: StudentDTO;
  role: MarkerType;
  status: OverallMarkingStatus;
  units: { unit: UnitOfAssessmentDTO; status: UnitMarkingStatus }[];
};

const columns: ColumnDef<TRow>[] = [
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
    cell: ({ row }) => <OverallStatusIndicator status={row.original.status} />,
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

function UoaStatusRow({
  unit,
  status,
}: {
  unit: UnitOfAssessmentDTO;
  status: UnitMarkingStatus;
}) {
  return (
    <TableRow>
      <TableCell>{unit.title}</TableCell>
      <TableCell>
        <UoaStatusIndicator status={status} />
      </TableCell>
    </TableRow>
  );
}

const CustomRow: CustomRowType<TRow> = ({ row }) => {
  return (
    <Fragment>
      <DefaultRow row={row} />
      {row.getIsExpanded() ? (
        row.original.units.map(({ unit, status }) => (
          <UoaStatusRow key={unit.id} unit={unit} status={status} />
        ))
      ) : (
        <Fragment />
      )}
    </Fragment>
  );
};

export function MarkingTodoTable({
  params,
  initialData,
}: {
  params: InstanceParams;
  initialData: TRow[];
}) {
  const { data } = api.user.newMarker.getAssignedMarking.useQuery(
    { params },
    { initialData },
  );

  return <DataTable columns={columns} data={data} CustomRow={CustomRow} />;
}
