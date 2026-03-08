"use client";

import {
  type MarkingStatusRow,
  MarkingStatusTable,
} from "@/components/marking/status-table";

import { api } from "@/lib/trpc/client";
import { type InstanceParams } from "@/lib/validations/params";

export function MarkingTodoTable({
  params,
  initialData,
}: {
  params: InstanceParams;
  initialData: MarkingStatusRow[];
}) {
  const { data } = api.user.newMarker.getAssignedMarking.useQuery(
    { params },
    { initialData },
  );

  return <MarkingStatusTable data={data} />;
}
