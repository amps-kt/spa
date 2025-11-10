import { type CustomRowType } from "@/components/ui/data-table/data-table";
import { DefaultRow } from "@/components/ui/data-table/default-row";
import { TableCell, TableRow } from "@/components/ui/table";

import { cn } from "@/lib/utils";

import { type ManualAllocationStudent } from "./manual-allocation-types";
import { WarningsDisplay } from "./warnings-display";

export const ManualAllocationRow: CustomRowType<ManualAllocationStudent> =
  function ({ row }) {
    const student = row.original;
    const hasWarnings = student.warnings.length > 0;

    return (
      <>
        <DefaultRow
          row={row}
          className={cn(
            "transition-colors",
            student.isDirty ? "bg-blue-50/50" : "hover:bg-muted/50",
            hasWarnings ? "border-b-0" : "border-b",
          )}
        />

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
