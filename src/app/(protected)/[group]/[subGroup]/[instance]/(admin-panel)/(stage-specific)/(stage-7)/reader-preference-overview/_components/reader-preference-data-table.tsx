"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { type ReaderDTO } from "@/dto";

import { buttonVariants } from "@/components/ui/button";
import DataTable from "@/components/ui/data-table/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";

import { AppInstanceLink } from "@/lib/routing";

interface Row {
  reader: ReaderDTO;
  numPreferred: number;
  numVetoed: number;
}

const cols: ColumnDef<Row>[] = [
  {
    id: "reader",
    accessorFn: (row) => row.reader.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reader" />
    ),
    cell: ({
      row: {
        original: { reader },
      },
    }) => (
      <div>
        <AppInstanceLink
          className={buttonVariants({ variant: "link" })}
          page="readerById"
          linkArgs={{ readerId: reader.id }}
        >
          {reader.name}
        </AppInstanceLink>
        <div className="ml-4 font-sm text-muted-foreground">{reader.id}</div>
        <div className="ml-4 text-sm text-muted-foreground">{reader.email}</div>
      </div>
    ),
  },
  {
    id: "Reading Workload Quota",
    accessorFn: ({ reader }) => reader.readingWorkloadQuota,
    header: ({ column }) => (
      <DataTableColumnHeader
        className="w-24"
        column={column}
        title="Workload"
      />
    ),
    cell: ({
      row: {
        original: { reader },
      },
    }) => <p className="w-24 text-center">{reader.readingWorkloadQuota}</p>,
  },
  {
    id: "preferred",
    accessorFn: (row) => row.numPreferred,
    header: ({ column }) => (
      <DataTableColumnHeader
        className="w-24"
        column={column}
        title="Preferred"
      />
    ),
    cell: ({ getValue }) => (
      <p className="w-24 text-center">{getValue<number>()}</p>
    ),
  },
  {
    id: "vetoed",
    accessorFn: (row) => row.numVetoed,
    header: ({ column }) => (
      <DataTableColumnHeader className="w-24" column={column} title="Vetoed" />
    ),
    cell: ({ getValue }) => (
      <p className="w-24 text-center">{getValue<number>()}</p>
    ),
  },
];

export function ReaderPreferencesDataTable({ data }: { data: Row[] }) {
  return <DataTable columns={cols} data={data} />;
}
