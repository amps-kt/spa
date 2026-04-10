"use client";

import { Fragment } from "react";

import { type ColumnDef } from "@tanstack/react-table";
import { SquareArrowOutUpRightIcon } from "lucide-react";

import {
  ReaderDTO,
  SupervisorDTO,
  type ProjectDTO,
  type StudentDTO,
  type UnitOfAssessmentDTO,
} from "@/dto";
import {
  type StudentGradingLifecycleState,
  type UnitGradingLifecycleState,
} from "@/dto/marking";

import { StudentGradingLifecycleBadge } from "@/components/ui/badges/student-grading-lifecycle-badge";
import { UnitGradingLifecycleBadge } from "@/components/ui/badges/unit-grading-lifecycle-badge";
import { buttonVariants } from "@/components/ui/button";
import { ActionColumnLabel } from "@/components/ui/data-table/action-column-label";
import { ExpandingCell } from "@/components/ui/data-table/cells/expanding-cell";
import { FlagCell } from "@/components/ui/data-table/cells/flag-cell";
import { StudentCell } from "@/components/ui/data-table/cells/student-cell";
import { UserCell } from "@/components/ui/data-table/cells/user-cell";
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
  status: StudentGradingLifecycleState;
  units: { unit: UnitOfAssessmentDTO; status: UnitGradingLifecycleState }[];
  reader?: ReaderDTO;
  supervisor: SupervisorDTO;
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
    id: "supervisor",
    accessorFn: ({ supervisor }) =>
      `${supervisor.email}${supervisor.id}${supervisor.name}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Supervisor" />
    ),
    cell: ({ row }) => <UserCell user={row.original.supervisor} />,
  },
  {
    id: "reader",
    accessorFn: ({ reader }) =>
      reader && `${reader.email}${reader.id}${reader.name}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reader" />
    ),
    cell: ({ row }) =>
      row.original.reader ? (
        <UserCell user={row.original.reader} />
      ) : (
        <p>Reader not allocated</p>
      ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <StudentGradingLifecycleBadge
        status={row.original.status}
        className="whitespace-nowrap"
      />
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

function UoaStatusRow({
  unit,
  status,
}: {
  unit: UnitOfAssessmentDTO;
  status: UnitGradingLifecycleState;
}) {
  return (
    <TableRow>
      <TableCell className="ml-4">{unit.title}</TableCell>
      <TableCell>
        <UnitGradingLifecycleBadge status={status} />
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

export function ByStudentsTable({
  params,
  initialData,
}: {
  params: InstanceParams;
  initialData: TRow[];
}) {
  const { data } = api.msp.admin.instance.getStudentMarkingStatus.useQuery(
    { params },
    { initialData },
  );

  return (
    <DataTable
      searchParamPrefix="student"
      columns={columns}
      data={data}
      CustomRow={CustomRow}
    />
  );
}
