"use client";

import { useState } from "react";

import { type ColumnDef } from "@tanstack/react-table";

import { type UnitOfAssessmentDTO, type StudentDTO } from "@/dto";

import { FlagCell } from "@/components/ui/data-table/cells/flag-cell";
import { StudentCell } from "@/components/ui/data-table/cells/student-cell";
import DataTable, {
  type CustomRowType,
} from "@/components/ui/data-table/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { DefaultRow } from "@/components/ui/data-table/default-row";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

import { DueDateCell } from "./cells/due-date-cell";
import { EnrolledCell } from "./cells/enrolled-cell";
import { SubmittedCell } from "./cells/submitted-cell";
import { WeightCell } from "./cells/weight-cell";

type WeightValue = number | "MV";

interface UnitRowState {
  unit: UnitOfAssessmentDTO;
  submitted: boolean;
  customDueDate?: Date;
  customWeight?: WeightValue;
}

interface Row {
  student: StudentDTO;
  unitsOfAssessment: {
    unit: UnitOfAssessmentDTO;
    submitted: boolean;
    customDueDate?: Date;
    customWeight?: WeightValue;
  }[];
}

const columnWidths = {
  student: "min-w-[160px] max-w-[200px]",
  flag: "min-w-[80px] max-w-[110px]",
  units: "min-w-[150px] max-w-[190px]",
  weight: "min-w-[120px] max-w-[160px]",
  dueDate: "min-w-[150px] max-w-[190px]",
  submitted: "min-w-[110px] max-w-[145px]",
  enrolled: "min-w-[110px] max-w-[145px]",
};

const columns: ColumnDef<Row>[] = [
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
    cell: ({ row }) => <StudentCell student={row.original.student} />,
    enableSorting: false,
  },
  {
    id: "flag",
    accessorFn: (row) => row.student.flag.displayName,
    header: () => <p>Flag</p>,
    cell: ({ row }) => <FlagCell flag={row.original.student.flag} />,
    enableSorting: false,
  },
  {
    id: "units",
    header: () => <p>Units of Assessment</p>,
    cell: () => <TableCell className={columnWidths.units} />,
    enableSorting: false,
  },
  {
    id: "weight",
    header: () => <p>Weight</p>,
    cell: () => <TableCell className={columnWidths.weight} />,
    enableSorting: false,
  },
  {
    id: "dueDate",
    header: () => <p>Due Date</p>,
    cell: () => <TableCell className={columnWidths.dueDate} />,
    enableSorting: false,
  },
  {
    id: "submitted",
    header: () => <p>Submitted? </p>,
    cell: () => <TableCell className={columnWidths.submitted} />,
    enableSorting: false,
  },
  {
    id: "enrolled",
    header: () => <p>Enrolled?</p>,
    cell: ({ row }) => (
      <EnrolledCell
        enrolled={row.original.student.enrolled}
        studentName={row.original.student.name}
        onChange={(enrolled) => {
          console.log(
            "Enrolled status changed for student:",
            row.original.student.name,
            enrolled,
          );
        }}
      />
    ),
    enableSorting: false,
  },
];

const CustomRow: CustomRowType<Row> = ({ row }) => {
  const [enrolled, setEnrolled] = useState(row.original.student.enrolled);
  const [units, setUnits] = useState<UnitRowState[]>(
    row.original.unitsOfAssessment.map((u) => ({
      unit: u.unit,
      submitted: u.submitted,
      customDueDate: u.customDueDate,
      customWeight: u.customWeight,
    })),
  );

  function updateUnit(
    index: number,
    patch: Partial<Omit<UnitRowState, "unit">>,
  ) {
    setUnits((prev) =>
      prev.map((unit, i) => (i === index ? { ...unit, ...patch } : unit)),
    );
  }

  return (
    <>
      <DefaultRow row={row} />

      {units.map((unitState, index) => {
        const displayWeight = unitState.customWeight ?? unitState.unit.weight;
        const displayDate =
          unitState.customDueDate ?? unitState.unit.studentSubmissionDeadline;

        return (
          <TableRow key={unitState.unit.id} className="bg-muted/30 h-16">
            <TableCell className={columnWidths.student} />
            <TableCell className={columnWidths.flag} />
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
                onChange={(value) => updateUnit(index, { customWeight: value })}
              />
            </TableCell>
            <TableCell className={columnWidths.dueDate}>
              <DueDateCell
                value={displayDate}
                onChange={(date) => updateUnit(index, { customDueDate: date })}
              />
            </TableCell>
            <TableCell className={columnWidths.submitted}>
              <SubmittedCell
                submitted={unitState.submitted}
                onChange={(value) => updateUnit(index, { submitted: value })}
              />
            </TableCell>
            <TableCell className={columnWidths.enrolled} />
          </TableRow>
        );
      })}
    </>
  );
};

export function StudentSubmissionsDataTable3({ data }: { data: Row[] }) {
  return (
    <DataTable
      className="w-full"
      columns={columns}
      data={data}
      CustomRow={CustomRow}
    />
  );
}
