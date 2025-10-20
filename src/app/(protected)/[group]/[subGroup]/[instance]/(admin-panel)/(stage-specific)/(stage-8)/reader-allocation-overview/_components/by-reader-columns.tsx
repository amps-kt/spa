"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { type ReaderDTO } from "@/dto";

import { buttonVariants } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { AppInstanceLink } from "@/lib/routing";

export const byReaderColumns: ColumnDef<{
  reader: ReaderDTO;
  numAllocations: number;
}>[] = [
  {
    id: "reader",
    accessorFn: ({ reader }) => reader,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reader" />
    ),
    cell: ({
      row: {
        original: { reader },
      },
    }) =>
      reader === undefined ? (
        <div />
      ) : (
        <div>
          <AppInstanceLink
            className={buttonVariants({ variant: "link" })}
            page="readerById"
            linkArgs={{ readerId: reader.id }}
          >
            {reader.name}
          </AppInstanceLink>
          <div className="ml-4 font-sm text-muted-foreground">{reader.id}</div>
          <div className="ml-4 text-sm text-muted-foreground">
            {reader.email}
          </div>
        </div>
      ),
  },
  {
    id: "target",
    accessorFn: ({ reader: { readingWorkloadQuota } }) => readingWorkloadQuota,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Workload" />
    ),
    cell: ({
      row: {
        original: {
          reader: { readingWorkloadQuota },
        },
      },
    }) => <div className="flex justify-center">{readingWorkloadQuota}</div>,
  },
  {
    id: "actual",
    accessorFn: ({ numAllocations }) => numAllocations,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="#Allocations" />
    ),
    cell: ({
      row: {
        original: { numAllocations },
      },
    }) => <div className="flex justify-center">{numAllocations}</div>,
  },
  {
    id: "delta",
    accessorFn: ({ numAllocations, reader: { readingWorkloadQuota } }) =>
      numAllocations - readingWorkloadQuota,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Difference" />
    ),
    cell: ({
      row: {
        original: {
          numAllocations,
          reader: { readingWorkloadQuota },
        },
      },
    }) => {
      const delta = numAllocations - readingWorkloadQuota;
      const tip =
        delta === 0
          ? "This reader was allocated exactly their target"
          : delta < 0
            ? "This reader was allocated less than their target"
            : "This reader was allocated more than their target";

      return (
        <WithTooltip tip={tip}>
          <div className="flex justify-around">{delta}</div>
        </WithTooltip>
      );
    },
  },
];
