"use client";

import { type UserDTO } from "@/dto";

import DataTable from "@/components/ui/data-table/data-table";

import { type SupervisorMatchingDetailsDTO } from "@/lib/validations/matching";

import { useSupervisorResultsColumns } from "./supervisor-results-columns";

export function SupervisorResultsDataTable({
  data,
}: {
  data: {
    supervisor: UserDTO;
    matchingDetails: SupervisorMatchingDetailsDTO;
  }[];
}) {
  const columns = useSupervisorResultsColumns();
  return (
    <DataTable searchParamPrefix="supervisor" columns={columns} data={data} />
  );
}
