"use client";

import { useMemo } from "react";

import { type ColumnDef } from "@tanstack/react-table";
import { CircleQuestionMarkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FlagCell } from "@/components/ui/data-table/cells/flag-cell";
import { StudentCell } from "@/components/ui/data-table/cells/student-cell";
import DataTable, {
  type CustomRowType,
} from "@/components/ui/data-table/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { TableCell, TableRow } from "@/components/ui/table";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { cn } from "@/lib/utils";

import { DueDateCell } from "./cells/due-date-cell";
import { EnrolledCell } from "./cells/enrolled-cell";
import { SubmittedCell } from "./cells/submitted-cell";
import { WeightCell } from "./cells/weight-cell";
import { ApplyToSection } from "./mass-actions/action-filters";

import { FlagTabFilter } from "./flag-tab-filter";
import {
  SubmissionsProvider,
  useSubmissions,
  useRowState,
  type StudentSubmissionsRow,
} from "./submissions-context";
import { QuickActionsTabSwitcher } from "./tab-switcher";

const columnWidths = {
  student: "min-w-[160px] max-w-[200px]",
  units: "min-w-[150px] max-w-[190px]",
  weight: "min-w-[120px] max-w-[160px]",
  dueDate: "min-w-[140px] max-w-[180px]",
  submitted: "min-w-[80px] max-w-[115px]",
  enrolled: "min-w-[110px] max-w-[145px]",
};

// this breaks away from our VERY established pattern of defining as much as possible in the column definition
// but maybe using the custom row is the better patternm, interested to have a discussion about this
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
    id: "weight",
    header: () => (
      <div
        className={cn(
          columnWidths.weight,
          "flex justify-start items-center gap-5",
        )}
      >
        <p>Weight</p>
        <WithTooltip
          tip={
            <p className="w-44 font-normal">
              Weight can be any positive integer or{" "}
              <code className="font-bold">MV</code>
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

const CustomRow: CustomRowType<StudentSubmissionsRow> = ({ row }) => {
  const studentId = row.original.student.id;
  const state = useRowState(studentId);
  const { updateEnrolled, updateUnit } = useSubmissions();

  const unitIds = useMemo(
    () => state?.units.map((u) => u.unit.id) ?? [],
    [state],
  );

  const { studentStatus, targetedUnitIds } = useSelectionIndicators(
    studentId,
    unitIds,
  );

  if (!state) return null;

  return (
    <>
      <TableRow
        className={cn(
          "h-16",
          studentStatus === "targeted" && "border-l-[3px] border-l-indigo-400",
          studentStatus === "excluded" && "border-l-[3px] border-l-rose-400",
          studentStatus === "none" && "border-l-[3px] border-l-transparent",
        )}
      >
        <TableCell className={columnWidths.student}>
          <StudentCell student={state.student} />
        </TableCell>
        <TableCell className={columnWidths.units}>
          <FlagCell flag={state.student.flag} className="justify-start" />
        </TableCell>
        <TableCell className={columnWidths.weight} />
        <TableCell className={columnWidths.dueDate} />
        <TableCell className={columnWidths.submitted} />
        <TableCell className={columnWidths.enrolled}>
          <EnrolledCell
            student={{ ...state.student, enrolled: state.enrolled }}
            onChange={(enrolled) => updateEnrolled(studentId, enrolled)}
          />
        </TableCell>
      </TableRow>

      {state.units.map((unitState) => {
        const displayWeight = unitState.customWeight ?? unitState.unit.weight;
        const displayDate =
          unitState.customDueDate ?? unitState.unit.studentSubmissionDeadline;

        // a unit sub-row is highlighted if BOTH the unit is selected
        // AND the student is targeted
        const isUnitTargeted =
          studentStatus === "targeted" &&
          targetedUnitIds.has(unitState.unit.id);

        return (
          <TableRow
            key={unitState.unit.id}
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
              {unitState.unit.title}
            </TableCell>
            <TableCell className={columnWidths.weight}>
              <WeightCell
                value={displayWeight}
                onChange={(value) =>
                  updateUnit(studentId, unitState.unit.id, {
                    customWeight: value,
                  })
                }
              />
            </TableCell>
            <TableCell className={columnWidths.dueDate}>
              <DueDateCell
                value={displayDate}
                onChange={(date) =>
                  updateUnit(studentId, unitState.unit.id, {
                    customDueDate: date,
                  })
                }
              />
            </TableCell>
            <TableCell className={columnWidths.submitted}>
              <SubmittedCell
                submitted={unitState.submitted}
                onChange={(value) =>
                  updateUnit(studentId, unitState.unit.id, { submitted: value })
                }
              />
            </TableCell>
            <TableCell className={columnWidths.enrolled} />
          </TableRow>
        );
      })}
    </>
  );
};

type StudentTargetStatus = "targeted" | "excluded" | "none";

// ? this feels like it's too much of a presentation util to be moved to the context file, but open to feedback
function useSelectionIndicators(studentId: string, unitIds: string[]) {
  const {
    selectedUnitIds,
    selectedStudentIds,
    selectionMode,
    visibleStudents,
  } = useSubmissions();

  return useMemo(() => {
    const selectedUnitSet = new Set(selectedUnitIds);
    const selectedStudentSet = new Set(selectedStudentIds);
    const isVisible = visibleStudents.some((s) => s.id === studentId);

    const targetedUnitIds = new Set(
      unitIds.filter((id) => selectedUnitSet.has(id)),
    );

    let status: StudentTargetStatus = "none";

    if (selectedUnitSet.size > 0 && isVisible) {
      // ? I didn't make enums before cause these both felt really minor,
      // ? but now that we have a bunch of magic strings everywhere maybe I should?
      if (selectionMode === "exclude") {
        status = selectedStudentSet.has(studentId) ? "excluded" : "targeted";
      } else {
        // include mode
        status = selectedStudentSet.has(studentId) ? "targeted" : "none";
      }
    }

    return { studentStatus: status, targetedUnitIds };
  }, [
    studentId,
    unitIds,
    selectedUnitIds,
    selectedStudentIds,
    selectionMode,
    visibleStudents,
  ]);
}

// Inner component that reads the filtered data from context and passes it to DataTable
// Separated so that the context is available
// the provider wraps this in the public component below, don't know how else to get it working
function InnerDataTable() {
  const { visibleRows } = useSubmissions();

  // because the filtering source of truth is in the context we're actually not making use of the Tanstack table filtering
  // and I have to manually filter the data every time the `activeFlag` changes.
  // Which means I have to convert my internal state representation back to the row shape that DataTable/columns expect
  const tableData = useMemo<StudentSubmissionsRow[]>(
    () =>
      visibleRows.map((row) => ({
        student: { ...row.student, enrolled: row.enrolled },
        unitsOfAssessment: row.units.map((u) => ({
          unit: u.unit,
          submitted: u.submitted,
          customDueDate: u.customDueDate,
          customWeight: u.customWeight,
        })),
      })),
    [visibleRows],
  );

  return (
    <DataTable
      className="w-full"
      columns={columns}
      data={tableData}
      CustomRow={CustomRow}
      hideViewOptions={true}
    />
  );
}

export function StudentSubmissionsDataTable({
  data,
}: {
  data: StudentSubmissionsRow[];
}) {
  return (
    <SubmissionsProvider data={data}>
      <div className="flex flex-col gap-8">
        <FlagTabFilter />
        <ApplyToSection />
        <QuickActionsTabSwitcher />
        <InnerDataTable />
      </div>
    </SubmissionsProvider>
  );
}
