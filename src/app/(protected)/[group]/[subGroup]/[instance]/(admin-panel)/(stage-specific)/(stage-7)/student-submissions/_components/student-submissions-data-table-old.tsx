"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { type StudentDTO, type UnitOfAssessmentDTO } from "@/dto";

import { buttonVariants } from "@/components/ui/button";
import { FlagCell } from "@/components/ui/data-table/cells/flag-cell";
import DataTable, {
  type CustomRowType,
} from "@/components/ui/data-table/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { DefaultRow } from "@/components/ui/data-table/default-row";
import { TableCell, TableRow } from "@/components/ui/table";

import { AppInstanceLink } from "@/lib/routing";
import { cn } from "@/lib/utils";

interface Row {
  student: StudentDTO & { enrolled: boolean };
  unitsOfAssessment: {
    unit: UnitOfAssessmentDTO;
    submitted: boolean;
    customDueDate?: Date;
    customWeight?: number;
  }[];
}

const columnWidths = {
  student: "min-w-[160px] max-w-[200px]",
  flag: "min-w-[80px] max-w-[100px]",
  units: "min-w-[140px] max-w-[180px]",
  weight: "min-w-[120px] max-w-[160px]",
  dueDate: "min-w-[140px] max-w-[180px]",
  submitted: "min-w-[130px] max-w-[165px]",
  enrolled: "min-w-[130px] max-w-[165px]",
};

const cols: ColumnDef<Row>[] = [
  {
    id: "student",
    accessorFn: (row) => row.student.name,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Student"
        className={columnWidths.student}
      />
    ),
    cell: ({
      row: {
        original: { student },
      },
    }) => (
      <div className={cn(columnWidths.student, "whitespace-normal")}>
        <AppInstanceLink
          className={buttonVariants({ variant: "link" })}
          page="studentById"
          linkArgs={{ studentId: student.id }}
        >
          {student.name}
        </AppInstanceLink>
        <div className="ml-4 font-sm text-muted-foreground">{student.id}</div>
        <div className="ml-4 text-sm text-muted-foreground">
          {student.email}
        </div>
      </div>
    ),
  },
  {
    id: "Flag",
    header: () => (
      <div className={cn(columnWidths.flag, "text-center")}>Flag</div>
    ),
    cell: ({ row }) => (
      <FlagCell
        flag={row.original.student.flag}
        className={cn(columnWidths.flag, "grid place-items-center")}
      />
    ),
  },
  {
    id: "Units of Assessment",
    header: () => <div className={columnWidths.units}>Units of Assessment</div>,
    cell: () => null,
  },
  {
    id: "Weight",
    header: () => <div className={columnWidths.weight}>Weight</div>,
    cell: () => null,
  },
  {
    id: "Due Date",
    header: () => <div className={columnWidths.dueDate}>Due Date</div>,
    cell: () => null,
  },
  {
    id: "Submitted?",
    header: () => <div className={columnWidths.submitted}>Submitted?</div>,
    cell: () => null,
  },
  {
    id: "Enrolled?",
    header: () => <div className={columnWidths.enrolled}>Enrolled?</div>,
    cell: () => null,
  },
];

export const UnitDetailsRow: CustomRowType<Row> = function ({ row }) {
  return (
    <>
      <DefaultRow row={row} />
      {row.original.unitsOfAssessment.map(
        ({ unit, submitted, customDueDate, customWeight }) => (
          <TableRow key={unit.id} className="bg-muted/30">
            {row.getVisibleCells().map((cell) => {
              switch (cell.column.id) {
                case "student":
                  return (
                    <TableCell key={cell.id} className={columnWidths.student} />
                  );
                case "Flag":
                  return (
                    <TableCell key={cell.id} className={columnWidths.flag} />
                  );
                case "Units of Assessment":
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        columnWidths.units,
                        "font-medium whitespace-normal",
                      )}
                    >
                      {unit.title}
                    </TableCell>
                  );
                case "Weight":
                  return (
                    <TableCell key={cell.id} className={columnWidths.weight}>
                      {customWeight ?? unit.weight}
                    </TableCell>
                  );
                case "Due Date":
                  return (
                    <TableCell key={cell.id} className={columnWidths.dueDate}>
                      {new Date(
                        customDueDate ?? unit.studentSubmissionDeadline,
                      ).toLocaleDateString()}
                    </TableCell>
                  );
                case "Submitted?":
                  return (
                    <TableCell key={cell.id} className={columnWidths.submitted}>
                      {submitted ? "Yes" : "No"}
                    </TableCell>
                  );
                case "Enrolled?":
                  return (
                    <TableCell key={cell.id} className={columnWidths.enrolled}>
                      {row.original.student.enrolled ? "Yes" : "No"}
                    </TableCell>
                  );
              }
            })}
          </TableRow>
        ),
      )}
    </>
  );
};

export function StudentSubmissionsDataTable({ data }: { data: Row[] }) {
  return (
    <DataTable
      className="w-full"
      columns={cols}
      data={data}
      CustomRow={UnitDetailsRow}
    />
  );
}
