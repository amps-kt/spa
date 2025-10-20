"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { type ReaderDTO } from "@/dto";

import { buttonVariants } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";

import { AppInstanceLink } from "@/lib/routing";

export function useAllReadersColumns({}: {
  shaddap: string;
}): ColumnDef<{ reader: ReaderDTO; numProjectsAssigned: number }>[] {
  return [
    {
      id: "reader",
      accessorFn: ({ reader }) => `${reader.name} ${reader.id} ${reader.email}`,
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
          <div className="font-sm text-muted-foreground">{reader.id}</div>
          <div className="text-sm text-muted-foreground">{reader.email}</div>
        </div>
      ),
    },
    {
      id: "quota",
      accessorFn: (s) => s.reader.readingWorkloadQuota,
      header: ({ column }) => (
        <DataTableColumnHeader
          className="w-24"
          column={column}
          title="Reading Workload Quota"
        />
      ),
      cell: ({
        row: {
          original: { reader },
        },
      }) => <p className="w-24 text-center">{reader.readingWorkloadQuota}</p>,
    },
    {
      id: "allocation",
      accessorFn: (s) => s.numProjectsAssigned,
      header: ({ column }) => (
        <DataTableColumnHeader
          className="w-24"
          column={column}
          title="Reading Workload Quota"
        />
      ),
      cell: ({ row: { original: s } }) => (
        <p className="w-24 text-center">{s.numProjectsAssigned}</p>
      ),
    },
    {
      id: "delta",
      accessorFn: (row) =>
        row.reader.readingWorkloadQuota - row.numProjectsAssigned,
      header: ({ column }) => (
        <DataTableColumnHeader className="w-24" column={column} title="Delta" />
      ),
      cell: ({ getValue }) => (
        <p className="w-24 text-center">{getValue<number>()}</p>
      ),
    },
  ];
}
