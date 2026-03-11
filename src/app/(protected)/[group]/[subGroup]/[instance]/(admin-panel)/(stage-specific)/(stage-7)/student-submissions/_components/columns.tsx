import { type ColumnDef } from "@tanstack/react-table";
import { CircleQuestionMarkIcon } from "lucide-react";

import { type StudentSubmissionsRow } from "@/dto/marking/student-submissions";

import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { cn } from "@/lib/utils";

export const columnWidths = {
  student: "min-w-[160px] max-w-[200px]",
  units: "min-w-[150px] max-w-[190px]",
  weight: "min-w-[80px] max-w-[115px]",
  dueDate: "min-w-[140px] max-w-[180px]",
  submitted: "min-w-[80px] max-w-[115px]",
  enrolled: "min-w-[110px] max-w-[145px]",
};

/**
 * Columns are header-only definitions. All cell rendering is handled
 * by CustomRow which reads mutable state from the submissions context
 *
 * accessorFn is kept for sorting/filtering support
 */
export const columns: ColumnDef<StudentSubmissionsRow>[] = [
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
    cell: () => null,
    enableSorting: false,
  },
  {
    id: "units",
    accessorFn: (row) => row.student.flag.displayName,
    header: () => <p className={columnWidths.units}>Units of Assessment</p>,
    cell: () => null,
    enableSorting: false,
  },
  {
    id: "dueDate",
    header: () => (
      <div
        className={cn(
          columnWidths.dueDate,
          "flex items-center justify-start gap-5",
        )}
      >
        <p>Due Date</p>
        <WithTooltip
          tip={
            <p className="w-44 font-normal">
              Markers have <strong>+14</strong> days from submission to mark
            </p>
          }
        >
          <Button
            variant="ghost"
            className="grid h-max place-items-center rounded-full p-1"
          >
            <CircleQuestionMarkIcon className="size-4" />
          </Button>
        </WithTooltip>
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "weight",
    header: () => (
      <div
        className={cn(
          columnWidths.weight,
          "flex items-center justify-start gap-5",
        )}
      >
        <p>MV?</p>
        <WithTooltip
          tip={
            <p className="w-52 font-normal">
              Ticked boxes mean this unit is marked as medically void for this
              student
            </p>
          }
        >
          <Button
            variant="ghost"
            className="grid h-max place-items-center rounded-full p-1"
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
    cell: () => null,
    enableSorting: false,
  },
  {
    id: "enrolled",
    header: () => <p className={columnWidths.enrolled}>Enrolled?</p>,
    cell: () => null,
    enableSorting: false,
  },
];
