import { useMemo, type ReactNode } from "react";

import { type Row } from "@tanstack/react-table";

import { type StudentDTO, type UnitOfAssessmentDTO } from "@/dto";
import { type StudentSubmissionsRow } from "@/dto/marking/student-submissions";

import { FlagCell } from "@/components/ui/data-table/cells/flag-cell";
import { StudentCell } from "@/components/ui/data-table/cells/student-cell";
import { TableCell, TableRow } from "@/components/ui/table";

import { cn } from "@/lib/utils";
import { zip } from "@/lib/utils/zip";

import { DueDateCell } from "./cells/due-date-cell";
import { EnrolledCell } from "./cells/enrolled-cell";
import { SubmittedCell } from "./cells/submitted-cell";
import { WeightCell } from "./cells/weight-cell";

import { columnWidths } from "./columns";
import { useSubmissions, useRowState } from "./submissions-context";
import {
  StudentTargetStatus,
  useSelectionIndicators,
} from "./use-selection-indicators";

export const CustomRow = ({
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
              ? (groundTruthUnit.grade.customWeight ?? unit.weight)
              : (unitState.customWeight ?? unit.weight);

          const displayDate =
            unitState.customDueDate ??
            groundTruthUnit.grade.customDueDate ??
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
                      groundTruthUnit.grade.customWeight ??
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
                    groundTruthUnit.grade.studentSubmitted
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
