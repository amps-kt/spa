"use client";

import { ColumnDef } from "@tanstack/react-table";

import { UserDTO } from "@/dto";

import { UserCell } from "@/components/ui/data-table/cells/user-cell";
import DataTable from "@/components/ui/data-table/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";

import { InstanceParams } from "@/lib/validations/params";

interface TRow {
  marker: UserDTO;
  numProjectsToMark: number;
  numNotDone: number;
  numBlocked: number;
  numActionable: number;
}

const columns: ColumnDef<TRow>[] = [
  {
    id: "marker",
    accessorFn: ({ marker }) => `${marker.email}${marker.id}${marker.name}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Marker" />
    ),
    cell: ({ row }) => <UserCell user={row.original.marker} />,
  },
  {
    id: "numProjectsToMark",
    accessorFn: ({ numProjectsToMark }) => numProjectsToMark,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="# Projects to mark" />
    ),
  },
  {
    id: "numNotDone",
    accessorFn: ({ numNotDone }) => numNotDone,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="# Projects not done" />
    ),
  },
  {
    id: "numBlocked",
    accessorFn: ({ numBlocked }) => numBlocked,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="# Blocked" />
    ),
  },
  {
    id: "numBlocked",
    accessorFn: ({ numBlocked }) => numBlocked,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="# Actionable" />
    ),
  },
];

export function ByMarkerTable({
  params,
  initialData,
}: {
  params: InstanceParams;
  initialData: TRow[];
}) {
  return (
    <DataTable
      searchParamPrefix="marker"
      columns={columns}
      data={initialData}
    />
  );
}
