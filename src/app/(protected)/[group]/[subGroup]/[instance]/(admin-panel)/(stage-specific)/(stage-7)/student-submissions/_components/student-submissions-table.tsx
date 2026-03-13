"use client";

import { type StudentDTO, type UnitOfAssessmentDTO, type FlagDTO } from "@/dto";
import { type StudentSubmissionsRow } from "@/dto/marking/student-submissions";

import { useInstanceParams } from "@/components/params-context";
import DataTable from "@/components/ui/data-table/data-table";
import { Skeleton } from "@/components/ui/skeleton";

import { api } from "@/lib/trpc/client";
import { keyBy } from "@/lib/utils/key-by";

import { ApplyToControls } from "./mass-actions/apply-to-controls";

import { columns } from "./columns";
import { CustomRow } from "./custom-row";
import { FlagTabFilter } from "./flag-tab-filter";
import { PendingChangesBar } from "./pending-changes-bar";
import { SubmissionsProvider, useSubmissions } from "./submissions-context";
import { QuickActionsTabSwitcher } from "./tab-switcher";

function InnerDataTable({
  studentMap,
  uoaMap,
}: {
  studentMap: Record<string, StudentDTO>;
  uoaMap: Record<string, UnitOfAssessmentDTO>;
}) {
  const { activeFlag, studentSubmissionsByFlag } = useSubmissions();

  return (
    <DataTable
      className="w-full"
      columns={columns}
      data={studentSubmissionsByFlag[activeFlag]}
      CustomRow={({ row }) => (
        <CustomRow row={row} studentMap={studentMap} uoaMap={uoaMap} />
      )}
      hideViewOptions={true}
    />
  );
}

export function StudentSubmissionsDataTable({
  rowData,
  availableFlags,
  studentMap,
  uoaMap,
}: {
  rowData: { flagId: string; data: StudentSubmissionsRow[] }[];
  availableFlags: FlagDTO[];
  studentMap: Record<string, StudentDTO>;
  uoaMap: Record<string, UnitOfAssessmentDTO>;
}) {
  const params = useInstanceParams();

  const rowsPerFlag = api.useQueries((t) =>
    rowData.map((data) =>
      t.teachingOffice.getFlagStudentSubmissionInfo(
        { params, flagId: data.flagId },
        { initialData: data },
      ),
    ),
  );

  if (!rowsPerFlag.every((s) => s.status === "success")) {
    return <Skeleton />;
  }

  const studentsByFlag = keyBy(
    rowsPerFlag.map((s) => s.data),
    (x) => x.flagId,
    (x) => x.data,
  );

  return (
    <SubmissionsProvider
      availableFlags={availableFlags}
      studentSubmissionsByFlag={studentsByFlag}
    >
      <div className="flex flex-col gap-8">
        <FlagTabFilter availableFlags={availableFlags} />
        <ApplyToControls studentMap={studentMap} uoaMap={uoaMap} />
        <QuickActionsTabSwitcher />
        <InnerDataTable studentMap={studentMap} uoaMap={uoaMap} />
        <PendingChangesBar studentMap={studentMap} uoaMap={uoaMap} />
      </div>
    </SubmissionsProvider>
  );
}
