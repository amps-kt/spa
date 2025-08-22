// eslint-disable-next-line no-restricted-imports
import { Slot } from "@radix-ui/react-slot";

import { type CustomRowType } from "@/components/ui/data-table/data-table";
import { TableCell, TableRow } from "@/components/ui/table";

import { cn } from "@/lib/utils";

import { type ManualReadingAllocationRow } from "./manual-allocation-types";
import { WarningsDisplay } from "./warnings-display";

export const ManualAllocationRow: CustomRowType<ManualReadingAllocationRow> =
  function ({ row, defaultRow }) {
    const projectData = row.original;
    const hasWarnings = projectData.warnings.length > 0;

    return (
      <>
        <Slot
          className={cn(
            "transition-colors",
            projectData.isDirty ? "bg-blue-50/50" : "hover:bg-muted/50",
            hasWarnings ? "border-b-0" : "border-b",
          )}
        >
          {defaultRow}
        </Slot>

        {hasWarnings && (
          <TableRow
            className={cn(
              "border-b",
              projectData.isDirty ? "bg-blue-50/30" : "bg-gray-50/50",
            )}
          >
            <TableCell
              colSpan={row.getVisibleCells().length}
              className="px-4 py-3"
            >
              <WarningsDisplay warnings={projectData.warnings} />
            </TableCell>
          </TableRow>
        )}
      </>
    );
  };
