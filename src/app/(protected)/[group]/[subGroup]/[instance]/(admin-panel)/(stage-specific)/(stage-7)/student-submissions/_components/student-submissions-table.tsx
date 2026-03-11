"use client";

import { useMemo, type ReactNode } from "react";

import { type Row, type ColumnDef } from "@tanstack/react-table";
import { CircleQuestionMarkIcon } from "lucide-react";

import { type StudentDTO, type UnitOfAssessmentDTO, type FlagDTO } from "@/dto";
import { type StudentSubmissionsRow } from "@/dto/marking/student-submissions";

import { useInstanceParams } from "@/components/params-context";
import { Button } from "@/components/ui/button";
import { FlagCell } from "@/components/ui/data-table/cells/flag-cell";
import { StudentCell } from "@/components/ui/data-table/cells/student-cell";
import DataTable from "@/components/ui/data-table/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { api } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { keyBy } from "@/lib/utils/key-by";
import { zip } from "@/lib/utils/zip";

import { DueDateCell } from "./cells/due-date-cell";
import { EnrolledCell } from "./cells/enrolled-cell";
import { SubmittedCell } from "./cells/submitted-cell";
import { WeightCell } from "./cells/weight-cell";
import { ApplyToControls } from "./mass-actions/apply-to-controls";

import { FlagTabFilter } from "./flag-tab-filter";
import { PendingChangesBar } from "./pending-changes-bar";
import {
  SubmissionsProvider,
  useSubmissions,
  useRowState,
} from "./submissions-context";
import { QuickActionsTabSwitcher } from "./tab-switcher";
import {
  StudentTargetStatus,
  useSelectionIndicators,
} from "./use-selection-indicators";

const columnWidths = {
  student: "min-w-[160px] max-w-[200px]",
  units: "min-w-[150px] max-w-[190px]",
  weight: "min-w-[80px] max-w-[115px]",
  dueDate: "min-w-[140px] max-w-[180px]",
  submitted: "min-w-[80px] max-w-[115px]",
  enrolled: "min-w-[110px] max-w-[145px]",
};

/**
 * Columns are header-only definitions. All cell rendering is handled
 * by CustomRow which reads mutable state from the submissions context
 *
 * accessorFn is kept for sorting/filtering support
 */
const columns: ColumnDef<StudentSubmissionsRow>[] = [
  {
    id: "student",
    accessorFn: (row) => row.student.name,
    header: ({ column }) => (
      <DataTableColumnHeader
        title="Student"
        className={columnWidths.student}
        column={column}
      />
    ),
    cell: () => null,
    enableSorting: false,
  },
  {
    id: "units",
    accessorFn: (row) => row.student.flag.displayName,
    header: () => <p className={columnWidths.units}>Units of Assessment</p>,
    cell: () => null,
    enableSorting: false,
  },
  {
    id: "dueDate",
    header: () => (
      <div
        className={cn(
          columnWidths.dueDate,
          "flex items-center justify-start gap-5",
        )}
      >
        <p>Due Date</p>
        <WithTooltip
          tip={
            <p className="w-44 font-normal">
              Markers have <strong>+14</strong> days from submission to mark
            </p>
          }
        >
          <Button
            variant="ghost"
            className="grid h-max place-items-center rounded-full p-1"
          >
            <CircleQuestionMarkIcon className="size-4" />
          </Button>
        </WithTooltip>
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "weight",
    header: () => (
      <div
        className={cn(
          columnWidths.weight,
          "flex items-center justify-start gap-5",
        )}
      >
        <p>MV?</p>
        <WithTooltip
          tip={
            <p className="w-52 font-normal">
              Ticked boxes mean this unit is marked as medically void for this
              student
            </p>
          }
        >
          <Button
            variant="ghost"
            className="grid h-max place-items-center rounded-full p-1"
          >
            <CircleQuestionMarkIcon className="size-4" />
          </Button>
        </WithTooltip>
      </div>
    ),
    enableSorting: false,
  },

  {
    id: "submitted",
    header: () => <p className={columnWidths.submitted}>Submitted?</p>,
    cell: () => null,
    enableSorting: false,
  },
  {
    id: "enrolled",
    header: () => <p className={columnWidths.enrolled}>Enrolled?</p>,
    cell: () => null,
    enableSorting: false,
  },
];

const CustomRow = ({
  row,
  studentMap,
  uoaMap,
}: {
  row: Row<StudentSubmissionsRow>;
  studentMap: Record<string, StudentDTO>;
  uoaMap: Record<string, UnitOfAssessmentDTO>;
}): ReactNode => {
  const studentId = row.original.student.id;

  const state = useRowState(studentId);
  const { updateEnrolled, updateUnit } = useSubmissions();

  const unitIds = useMemo(
    () => state.units.map((u) => u.unitId) ?? [],
    [state],
  );

  const { studentStatus, targetedUnitIds } = useSelectionIndicators(
    studentId,
    unitIds,
  );

  let student = studentMap[state.studentId];
  if (state.enrolled !== undefined) {
    student = { ...student, enrolled: state.enrolled };
  }

  return (
    <>
      <TableRow
        className={cn(
          "h-16",
          studentStatus === StudentTargetStatus.TARGETED &&
            "border-l-[3px] border-l-indigo-400",
          studentStatus === StudentTargetStatus.EXCLUDED &&
            "border-l-[3px] border-l-rose-400",
          studentStatus === StudentTargetStatus.NONE &&
            "border-l-[3px] border-l-transparent",
        )}
      >
        <TableCell className={columnWidths.student}>
          <StudentCell student={student} />
        </TableCell>
        <TableCell className={columnWidths.units}>
          <FlagCell flag={student.flag} className="justify-start" />
        </TableCell>
        <TableCell className={columnWidths.weight} />
        <TableCell className={columnWidths.dueDate} />
        <TableCell className={columnWidths.submitted} />
        <TableCell className={columnWidths.enrolled}>
          <EnrolledCell
            student={student}
            onChange={(enrolled) => updateEnrolled(studentId, enrolled)}
          />
        </TableCell>
      </TableRow>

      {zip(state.units, row.original.units).map(
        ([unitState, groundTruthUnit]) => {
          const unit = uoaMap[unitState.unitId];

          const displayWeight =
            unitState.customWeight === undefined
              ? (groundTruthUnit.submissionInfo.customWeight ?? unit.weight)
              : (unitState.customWeight ?? unit.weight);

          const displayDate =
            unitState.customDueDate ??
            groundTruthUnit.submissionInfo.customDueDate ??
            unit.studentSubmissionDeadline;

          // a unit sub-row is highlighted if BOTH the unit is selected
          // AND the student is targeted
          const isUnitTargeted =
            studentStatus === StudentTargetStatus.TARGETED &&
            targetedUnitIds.has(unitState.unitId);

          return (
            <TableRow
              key={unitState.unitId}
              className={cn(
                "h-16 bg-muted/30",
                isUnitTargeted
                  ? "border-l-[3px] border-l-indigo-400"
                  : "border-l-[3px] border-l-transparent",
              )}
            >
              <TableCell className={columnWidths.student} />
              <TableCell
                className={cn(
                  columnWidths.units,
                  "whitespace-normal font-medium",
                )}
              >
                {unit.title}
              </TableCell>
              <TableCell className={columnWidths.dueDate}>
                <DueDateCell
                  value={displayDate}
                  onChange={(date) =>
                    updateUnit(studentId, unit.id, { customDueDate: date })
                  }
                />
              </TableCell>
              <TableCell className={columnWidths.weight}>
                <WeightCell
                  isMV={displayWeight === 0}
                  onChange={(mv) => {
                    const truthWeight =
                      groundTruthUnit.submissionInfo.customWeight ??
                      uoaMap[unit.id].weight;
                    const isTruthMV = truthWeight === 0;

                    let customWeight: number | null | undefined;
                    if (mv === isTruthMV) {
                      // revert to committed truth — no delta needed
                      customWeight = undefined;
                    } else if (mv) {
                      // setting MV (truth was not MV)
                      customWeight = 0;
                    } else {
                      // unsetting MV (truth was MV) — clear the override
                      customWeight = null;
                    }

                    updateUnit(studentId, unit.id, { customWeight });
                  }}
                />
              </TableCell>
              <TableCell className={columnWidths.submitted}>
                <SubmittedCell
                  submitted={
                    unitState.submitted ??
                    groundTruthUnit.submissionInfo.studentSubmitted
                  }
                  onChange={(value) =>
                    updateUnit(studentId, unit.id, { submitted: value })
                  }
                />
              </TableCell>
              <TableCell className={columnWidths.enrolled} />
            </TableRow>
          );
        },
      )}
    </>
  );
};

// Inner component that reads the filtered data from context and passes it to DataTable
// Separated so that the context is available
// the provider wraps this in the public component below, don't know how else to get it working
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
