"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { CircleQuestionMarkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FlagCell } from "@/components/ui/data-table/cells/flag-cell";
import { StudentCell } from "@/components/ui/data-table/cells/student-cell";
import DataTable, {
  type CustomRowType,
} from "@/components/ui/data-table/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { TableCell, TableRow } from "@/components/ui/table";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { cn } from "@/lib/utils";

import { DueDateCell } from "./cells/due-date-cell";
import { EnrolledCell } from "./cells/enrolled-cell";
import { SubmittedCell } from "./cells/submitted-cell";
import { WeightCell } from "./cells/weight-cell";

import {
  SubmissionsProvider,
  useSubmissions,
  type StudentSubmissionsRow,
  useRowState,
} from "./submissions-context";

// because there's three different places where I'm hard-coding the width of columns, I figured this was not so bad
// I found [this](https://tanstack.com/table/latest/docs/api/features/column-sizing#size) which might be the actually correct move
const columnWidths = {
  student: "min-w-[160px] max-w-[200px]",
  units: "min-w-[150px] max-w-[190px]",
  weight: "min-w-[120px] max-w-[160px]",
  dueDate: "min-w-[140px] max-w-[180px]",
  submitted: "min-w-[80px] max-w-[115px]",
  enrolled: "min-w-[110px] max-w-[145px]",
};

// columns are just for header definitions and accessorFn for sorting/filtering
// this breaks away from our VERY established pattern of defining as much as possible in the column definition
const columns: ColumnDef<StudentSubmissionsRow>[] = [
  {
    id: "student",
    accessorFn: (row) => row.student.name,
    header: ({ column }) => (
      <DataTableColumnHeader
        title="Student"
        className={columnWidths.student}
        column={column}
      />
    ),
    enableSorting: false,
  },
  {
    id: "units",
    accessorFn: (row) => row.student.flag.displayName,
    header: () => <p className={columnWidths.units}>Units of Assessment</p>,
    enableSorting: false,
  },
  {
    id: "weight",
    header: () => (
      <div
        className={cn(
          columnWidths.weight,
          "flex justify-start items-center gap-5",
        )}
      >
        <p>Weight</p>
        <WithTooltip
          tip={
            <p className="font-normal w-44">
              Weight can be any positive integer or{" "}
              <code className="font-bold">MV</code>
            </p>
          }
        >
          <Button
            variant="ghost"
            className="grid place-items-center p-1 h-max rounded-full"
          >
            <CircleQuestionMarkIcon className="size-4" />
          </Button>
        </WithTooltip>
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "dueDate",
    header: () => (
      <div
        className={cn(
          columnWidths.dueDate,
          "flex justify-start items-center gap-5",
        )}
      >
        <p>Due Date</p>
        <WithTooltip
          tip={
            <p className="font-normal w-44">
              Markers have <strong>+14</strong> days from submission to mark
            </p>
          }
        >
          <Button
            variant="ghost"
            className="grid place-items-center p-1 h-max rounded-full"
          >
            <CircleQuestionMarkIcon className="size-4" />
          </Button>
        </WithTooltip>
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "submitted",
    header: () => <p className={columnWidths.submitted}>Submitted?</p>,
    enableSorting: false,
  },
  {
    id: "enrolled",
    header: () => <p className={columnWidths.enrolled}>Enrolled?</p>,
    enableSorting: false,
  },
];

const CustomRow: CustomRowType<StudentSubmissionsRow> = ({ row }) => {
  const studentId = row.original.student.id;
  const { updateEnrolled, updateUnit } = useSubmissions();
  const state = useRowState(studentId);

  // this should never actually be the case
  if (!state) return null;

  return (
    <>
      {/* main row */}
      <TableRow className="h-16">
        <TableCell className={columnWidths.student}>
          <StudentCell student={state.student} />
        </TableCell>
        <TableCell className={columnWidths.units}>
          <FlagCell flag={state.student.flag} className="justify-start" />
        </TableCell>
        <TableCell className={columnWidths.weight} />
        <TableCell className={columnWidths.dueDate} />
        <TableCell className={columnWidths.submitted} />
        <TableCell className={columnWidths.enrolled}>
          <EnrolledCell
            student={{ ...state.student, enrolled: state.enrolled }}
            onChange={(enrolled) => updateEnrolled(studentId, enrolled)}
          />
        </TableCell>
      </TableRow>

      {/* unit sub-rows */}
      {state.units.map((unitState) => {
        const displayWeight = unitState.customWeight ?? unitState.unit.weight;
        const displayDate =
          unitState.customDueDate ?? unitState.unit.studentSubmissionDeadline;

        return (
          <TableRow key={unitState.unit.id} className="bg-muted/30 h-16">
            <TableCell className={columnWidths.student} />
            <TableCell
              className={cn(
                columnWidths.units,
                "font-medium whitespace-normal",
              )}
            >
              {unitState.unit.title}
            </TableCell>
            <TableCell className={columnWidths.weight}>
              <WeightCell
                value={displayWeight}
                onChange={(value) =>
                  updateUnit(studentId, unitState.unit.id, {
                    customWeight: value,
                  })
                }
              />
            </TableCell>
            <TableCell className={columnWidths.dueDate}>
              <DueDateCell
                value={displayDate}
                onChange={(date) =>
                  updateUnit(studentId, unitState.unit.id, {
                    customDueDate: date,
                  })
                }
              />
            </TableCell>
            <TableCell className={columnWidths.submitted}>
              <SubmittedCell
                submitted={unitState.submitted}
                onChange={(value) =>
                  updateUnit(studentId, unitState.unit.id, { submitted: value })
                }
              />
            </TableCell>
            <TableCell className={columnWidths.enrolled} />
          </TableRow>
        );
      })}
    </>
  );
};

export function StudentSubmissionsDataTable({
  data,
}: {
  data: StudentSubmissionsRow[];
}) {
  return (
    <SubmissionsProvider data={data}>
      <DataTable
        className="w-full"
        columns={columns}
        data={data}
        CustomRow={CustomRow}
      />
    </SubmissionsProvider>
  );
}
