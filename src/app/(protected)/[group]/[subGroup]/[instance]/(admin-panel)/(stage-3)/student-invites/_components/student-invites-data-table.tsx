"use client";
import DataTable from "@/components/ui/data-table/data-table";
import { studentLevelFilter } from "@/components/ui/data-table/data-table-context";

import { StudentInviteDto } from "@/lib/validations/dto/student";

import { useStudentInvitesColumns } from "./student-invites-columns";

export function StudentInvitesDataTable({
  data,
}: {
  data: StudentInviteDto[];
}) {
  const columns = useStudentInvitesColumns();

  return (
    <DataTable
      className="w-full"
      searchableColumn={{ id: "Name", displayName: "Names" }}
      columns={columns}
      filters={[
        {
          columnId: "Status",
          title: "add filters",
          options: [
            { title: "Joined", id: "joined" },
            { title: "Invited", id: "invited" },
          ],
        },
        studentLevelFilter,
      ]}
      data={data}
    />
  );
}
