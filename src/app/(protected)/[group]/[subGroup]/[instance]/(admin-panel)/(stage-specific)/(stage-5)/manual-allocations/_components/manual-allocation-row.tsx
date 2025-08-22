// eslint-disable-next-line no-restricted-imports
import { Slot } from "@radix-ui/react-slot";

import { type CustomRowType } from "@/components/ui/data-table/data-table";
import { TableCell, TableRow } from "@/components/ui/table";

import { cn } from "@/lib/utils";

import { WarningsDisplay } from "./manual-allocation-data-table";
import { type ManualAllocationStudent } from "./manual-allocation-types";

export const ManualAllocationRow: CustomRowType<ManualAllocationStudent> =
  function ({ row, defaultRow }) {
    const student = row.original;
    const hasWarnings = student.warnings.length > 0;

    return (
      <>
        {/* Evil hack (cool): Use a slot to apply styles to the child */}
        <Slot
          className={cn(
            "transition-colors",
            student.isDirty ? "bg-blue-50/50" : "hover:bg-muted/50",
            hasWarnings ? "border-b-0" : "border-b",
          )}
        >
          {defaultRow}
        </Slot>

        {hasWarnings && (
          <TableRow
            className={cn(
              "border-b",
              student.isDirty ? "bg-blue-50/30" : "bg-gray-50/50",
            )}
          >
            <TableCell
              colSpan={row.getVisibleCells().length}
              className="px-4 py-3"
            >
              <WarningsDisplay warnings={student.warnings} />
            </TableCell>
          </TableRow>
        )}
      </>
    );
  };
