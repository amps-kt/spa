import { flexRender, type Row } from "@tanstack/react-table";

import { TableCell, TableRow } from "../table";

export function DefaultRow<T>({
  row,
  className,
}: {
  row: Row<T>;
  className?: string;
}) {
  return (
    <TableRow
      className={className}
      data-state={row.getIsSelected() && "selected"}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}
