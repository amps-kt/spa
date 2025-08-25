// eslint-disable-next-line no-restricted-imports
import { type CustomRowType } from "@/components/ui/data-table/data-table";
import { DefaultRow } from "@/components/ui/data-table/default-row";
import { TableCell, TableRow } from "@/components/ui/table";

import { cn } from "@/lib/utils";

import { type ManualReadingAllocationRow } from "./manual-allocation-types";
import { useWarningContext } from "./warning-context";
import { WarningsDisplay } from "./warnings-display";

export const ManualAllocationRow: CustomRowType<ManualReadingAllocationRow> =
  function ({ row }) {
    const projectData = row.original;
    const { getReaderQuotaWarning } = useWarningContext();

    const currentReaderId =
      projectData.selectedReaderId ?? projectData.originalReaderId;

    const warning = currentReaderId
      ? getReaderQuotaWarning(currentReaderId)
      : null;

    return (
      <>
        <DefaultRow
          row={row}
          className={cn(
            "transition-colors",
            projectData.isDirty ? "bg-blue-50/50" : "hover:bg-muted/50",
            warning ? "border-b-0" : "border-b",
          )}
        />

        {warning && (
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
              <WarningsDisplay warning={warning} />
            </TableCell>
          </TableRow>
        )}
      </>
    );
  };
