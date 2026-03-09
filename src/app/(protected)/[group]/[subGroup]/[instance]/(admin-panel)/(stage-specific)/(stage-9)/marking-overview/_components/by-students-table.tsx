import {
    type MarkingStatusRow,
    MarkingStatusTable,
} from "@/components/marking/status-table";

export function  ByStudentsTable({
  initialData,
}: {
  initialData: MarkingStatusRow;
}) {

  return <MarkingStatusTable data={} searchParamPrefix="student-table"/>;
}
