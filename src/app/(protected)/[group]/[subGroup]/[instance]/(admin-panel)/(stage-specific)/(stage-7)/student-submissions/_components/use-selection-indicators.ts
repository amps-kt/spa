import { useMemo } from "react";

import { StudentSelectionMode } from "./student-unit-selection";
import { useSubmissions } from "./submissions-context";

export const StudentTargetStatus = {
  TARGETED: "TARGETED",
  EXCLUDED: "EXCLUDED",
  NONE: "NONE",
} as const;

export type StudentTargetStatus = keyof typeof StudentTargetStatus;

export function useSelectionIndicators(studentId: string, unitIds: string[]) {
  const {
    selection: {
      state: {
        unitIds: selectedUnitIds,
        studentIds: selectedStudentIds,
        mode: selectionMode,
      },
    },
    studentSubmissionsByFlag,
    activeFlag,
  } = useSubmissions();

  return useMemo(() => {
    const selectedUnitSet = new Set(selectedUnitIds);
    const selectedStudentSet = new Set(selectedStudentIds);
    const isVisible = studentSubmissionsByFlag[activeFlag].some(
      (s) => s.student.id === studentId,
    );

    const targetedUnitIds = new Set(
      unitIds.filter((id) => selectedUnitSet.has(id)),
    );

    let status: StudentTargetStatus = StudentTargetStatus.NONE;

    if (selectedUnitSet.size > 0 && isVisible) {
      // ? I didn't make enums before cause these both felt really minor,
      // ? but now that we have a bunch of magic strings everywhere maybe I should?
      if (selectionMode === StudentSelectionMode.EXCLUDE) {
        status = selectedStudentSet.has(studentId)
          ? StudentTargetStatus.EXCLUDED
          : StudentTargetStatus.TARGETED;
      } else {
        // include mode
        status = selectedStudentSet.has(studentId)
          ? StudentTargetStatus.TARGETED
          : StudentTargetStatus.NONE;
      }
    }

    return { studentStatus: status, targetedUnitIds };
  }, [
    studentId,
    unitIds,
    selectedUnitIds,
    selectedStudentIds,
    selectionMode,
    studentSubmissionsByFlag,
    activeFlag,
  ]);
}
