"use client";

import { Fragment } from "react";

import { type UnitOfAssessmentDTO } from "@/dto";
import { type UnitGradingLifecycleState } from "@/dto/marking";

import { UnitGradingLifecycleBadge } from "@/components/ui/badges/unit-grading-lifecycle-badge";
import DataTable, {
  type CustomRowType,
} from "@/components/ui/data-table/data-table";
import { DefaultRow } from "@/components/ui/data-table/default-row";
import { TableCell, TableRow } from "@/components/ui/table";

import { columns, type MarkingStatusRow } from "./cols";

function UoaStatusRow({
  unit,
  status,
}: {
  unit: UnitOfAssessmentDTO;
  status: UnitGradingLifecycleState;
}) {
  return (
    <TableRow>
      <TableCell>{unit.title}</TableCell>
      <TableCell>
        <UnitGradingLifecycleBadge status={status} />
      </TableCell>
    </TableRow>
  );
}

const CustomRow: CustomRowType<MarkingStatusRow> = ({ row }) => {
  return (
    <Fragment>
      <DefaultRow row={row} />
      {row.getIsExpanded() ? (
        row.original.units.map(({ unit, status }) => (
          <UoaStatusRow key={unit.id} unit={unit} status={status} />
        ))
      ) : (
        <Fragment />
      )}
    </Fragment>
  );
};

export function MarkingStatusTable({
  data,
  searchParamPrefix,
}: {
  searchParamPrefix?: string;
  data: MarkingStatusRow[];
}) {
  return (
    <DataTable
      searchParamPrefix={searchParamPrefix}
      columns={columns}
      data={data}
      CustomRow={CustomRow}
    />
  );
}
