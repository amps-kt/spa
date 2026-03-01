"use client";

import { useCallback, useMemo } from "react";

import { useImmer } from "use-immer";

export const StudentSelectionMode = {
  INCLUDE: "INCLUDE",
  EXCLUDE: "EXCLUDE",
} as const;

export type StudentSelectionMode = keyof typeof StudentSelectionMode;

interface SelectionState {
  mode: StudentSelectionMode;
  unitIds: string[];
  studentIds: string[];
}

function isSelectionEmpty(s: SelectionState, maxStudents: number): boolean {
  if (s.unitIds.length === 0) return true;
  if (s.mode === StudentSelectionMode.EXCLUDE) {
    return s.studentIds.length !== maxStudents;
  } else {
    // assert(s.mode === StudentSelectionMode.INCLUDE)
    return s.studentIds.length === 0;
  }
}

const isSelectionValid = (s: SelectionState, maxStudents: number) =>
  !isSelectionEmpty(s, maxStudents);

export function useSelectionState(maxStudents: number) {
  const [state, setState] = useImmer<SelectionState>({
    mode: StudentSelectionMode.INCLUDE,
    unitIds: [],
    studentIds: [],
  });

  const setMode = useCallback(
    (mode: StudentSelectionMode) =>
      setState((draft) => {
        draft.mode = mode;
      }),
    [setState],
  );

  const setStudentIds = useCallback(
    (studentIds: string[]) =>
      setState((draft) => {
        draft.studentIds = studentIds;
      }),
    [setState],
  );

  const setUnitIds = useCallback(
    (unitIds: string[]) =>
      setState((draft) => {
        draft.unitIds = unitIds;
      }),
    [setState],
  );

  const isValid = useMemo(
    () => isSelectionValid(state, maxStudents),
    [state, maxStudents],
  );

  const clearSelection = useCallback(
    () =>
      setState({
        mode: StudentSelectionMode.INCLUDE,
        unitIds: [],
        studentIds: [],
      }),
    [setState],
  );

  return { state, setMode, setStudentIds, setUnitIds, clearSelection, isValid };
}
