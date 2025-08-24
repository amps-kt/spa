"use client";

import { type ReactNode } from "react";

import type { ColumnDef, Row } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";

import { useRowSelectionSearchParams } from "./hooks/row-selection";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar, type TableFilter } from "./data-table-toolbar";
import { DefaultRow } from "./default-row";
import {
  usePaginationSearchParams,
  useVisibilitySearchParams,
  useSortingSearchParams,
  useColumnFilterSearchParams,
  useGlobalFilterSearchParams,
} from "./hooks";

export type CustomRowType<TData> = (props: {
  row: Row<TData>;
  defaultRow: ReactNode;
}) => ReactNode;

interface DataTableProps<TData, TValue> {
  searchParamPrefix?: string;
  className?: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filters?: TableFilter[];
  removeRow?: () => void;
  CustomRow?: CustomRowType<TData>;
}

export default function DataTable<TData, TValue>({
  searchParamPrefix: prefix,
  className,
  columns,
  data,
  filters = [],
  removeRow,
  CustomRow,
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = usePaginationSearchParams(prefix);
  const [columnVisibility, setColumnVisibility] = useVisibilitySearchParams(
    columns,
    prefix,
  );

  const [sorting, setSorting] = useSortingSearchParams(prefix);

  const [columnFilters, setColumnFilters] = useColumnFilterSearchParams(
    columns,
    prefix,
  );

  const [globalFilter, setGlobalFilter] = useGlobalFilterSearchParams(prefix);

  const [rowSelection, setRowSelection] = useRowSelectionSearchParams(prefix);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),

    getPaginationRowModel: getPaginationRowModel(),

    onPaginationChange: (x) => void setPagination(x),

    onColumnVisibilityChange: setColumnVisibility,

    getSortedRowModel: getSortedRowModel(),
    enableMultiSort: false,
    onSortingChange: setSorting,

    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,

    onGlobalFilterChange: (x: string) => void setGlobalFilter(x),

    onRowSelectionChange: setRowSelection,
    state: {
      globalFilter,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      sorting,
    },
    meta: { removeRow: removeRow },
  });

  return (
    <div className={cn(className)}>
      <div className="flex items-center gap-4 py-4">
        <DataTableToolbar data={data} filters={filters} table={table} />
      </div>
      <div className="w-full rounded-md border border-accent dark:border-slate-600">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table
                .getRowModel()
                .rows.map((row) =>
                  CustomRow ? (
                    <CustomRow
                      key={row.id}
                      row={row}
                      defaultRow={<DefaultRow row={row} />}
                    />
                  ) : (
                    <DefaultRow key={row.id} row={row} />
                  ),
                )
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No Results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {table.getFooterGroups().length !== 0 && (
            <TableFooter>
              {table.getFooterGroups().map((footerGroup) => (
                <TableRow key={footerGroup.id}>
                  {footerGroup.headers.map((header) => (
                    <TableCell key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.footer,
                            header.getContext(),
                          )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableFooter>
          )}
        </Table>
      </div>
      <div className="flex w-full items-center justify-end space-x-2 py-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
