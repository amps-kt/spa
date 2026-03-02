"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { produce } from "immer";
import { createParser, useQueryState } from "nuqs";
import { useImmer } from "use-immer";

import {
  type FlagDTO,
  type StudentDTO,
  type UnitGradeDTO__NEW as UnitGradeDTO,
  type UnitOfAssessmentDTO,
} from "@/dto";

import { setDiff } from "@/lib/utils/general/set-difference";
import { setIntersection } from "@/lib/utils/general/set-intersection";
import { keyBy } from "@/lib/utils/key-by";

import {
  StudentSelectionMode,
  useSelectionState,
} from "./student-unit-selection";

// Data table rows contain general information about the student, all captured in the StudentDTO
// and information about the specific uoas they have to be graded on
// This is just the shape of the data as it gets returned from the server
export interface StudentSubmissionsRow {
  student: StudentDTO;
  units: { unit: UnitOfAssessmentDTO; grade: UnitGradeDTO }[];
}

// local mutable copy of student-level state - enrolled is lifted out of the DTO
// so we can update it without reconstructing the entire StudentDTO on every change
export interface StudentDelta {
  studentId: string;
  enrolled?: boolean;
  units: UnitDelta[];
}

// same thing but for units
export interface UnitDelta {
  unitId: string;
  submitted?: boolean;
  customDueDate?: Date;
  customWeight?: number;
}

interface SubmissionsContextType {
  /* Ground truth from server */
  studentSubmissionsByFlag: Record<string, StudentSubmissionsRow[]>;

  /** Current mutable state for every row */
  studentDeltasByFlag: Record<string, StudentDelta[]>;

  unitIdsByFlag: Record<string, string[]>;

  /** Currently active flag filter */
  activeFlag: string;

  /** Set the active flag filter */
  setActiveFlag: (flagId: string) => void;

  /** Which flag tabs currently have pending changes */
  dirtyFlags: Set<string>;

  selection: ReturnType<typeof useSelectionState>;

  /** Update the enrolled status for a student */
  updateEnrolled: (studentId: string, enrolled: boolean) => void;

  /** Patch a specific unit for a specific student */
  updateUnit: (
    studentId: string,
    unitId: string,
    patch: Partial<Omit<UnitDelta, "unitId">>,
  ) => void;

  /**
   * Apply a patch to specific units across multiple students.
   * Targets all visible students minus the excluded set.
   */
  batchUpdateUnits: (patch: Partial<Omit<UnitDelta, "unitId">>) => void;

  /** Whether any row has been modified */
  isDirty: boolean;

  /** Reset local state back to the original server data */
  resetFlag: (flagId: string) => void;
}

const SubmissionsContext = createContext<SubmissionsContextType | null>(null);

// --------------------------------------------------------------- hooks

export function useSubmissions() {
  const ctx = useContext(SubmissionsContext);
  if (!ctx) {
    throw new Error("useSubmissions must be used within a SubmissionsProvider");
  }
  return ctx;
}

export function useRowState(studentId: string): StudentDelta {
  const { studentDeltasByFlag, activeFlag } = useSubmissions();
  const studentDelta = studentDeltasByFlag[activeFlag].find(
    (r) => r.studentId === studentId,
  );

  if (!studentDelta) throw Error(`No StudentDelta for student: ${studentId}`);
  return studentDelta;
}

// ------------------------------------------------------------ provider

function buildInitialState(
  data: Record<string, StudentSubmissionsRow[]>,
): Record<string, StudentDelta[]> {
  const byflags = Object.keys(data).map((flagId) => ({
    flagId,
    data: data[flagId].map(zeroDelta),
  }));

  return keyBy(
    byflags,
    (x) => x.flagId,
    (x) => x.data,
  );
}

function zeroDelta(s: StudentSubmissionsRow): StudentDelta {
  return {
    studentId: s.student.id,
    units: s.units.map((u) => ({ unitId: u.unit.id })),
  };
}

function hasPendingChanges(rows: StudentDelta[]): boolean {
  return rows.some(
    (r) =>
      r.enrolled !== undefined ||
      r.units.some(
        (u) =>
          u.customDueDate !== undefined ||
          u.customWeight !== undefined ||
          u.submitted !== undefined,
      ),
  );
}

export function computeChangeCount(delta: StudentDelta): number {
  return (
    (delta.enrolled !== undefined ? 1 : 0) +
    delta.units.reduce((sum, u) => sum + computeUnitChangeCount(u), 0)
  );
}

export function computeUnitChangeCount(delta: UnitDelta): number {
  let fields = 0;
  if (delta.submitted !== undefined) fields++;
  if (delta.customDueDate !== undefined) fields++;
  if (delta.customWeight !== undefined) fields++;
  return fields;
}

function computeUnitDeltaFromPatch(
  patch: UnitDelta,
  truth: UnitGradeDTO,
): UnitDelta {
  return produce(patch, (patch) => {
    if (patch.customDueDate === truth.customDueDate) {
      delete patch.customDueDate;
    }
    if (patch.customWeight === truth.customWeight) {
      delete patch.customWeight;
    }
    if (patch.submitted === truth.studentSubmitted) {
      delete patch.submitted;
    }
  });
}

function createFlagParser(validFlags: string[]) {
  return createParser({
    parse: (queryValue) => {
      const cleanVal = queryValue.trim().toLowerCase();
      return validFlags.includes(cleanVal) ? cleanVal : null;
    },
    serialize: (value) => value,
  });
}

export function SubmissionsProvider({
  studentSubmissionsByFlag,
  availableFlags,
  children,
}: {
  studentSubmissionsByFlag: Record<string, StudentSubmissionsRow[]>;
  availableFlags: FlagDTO[];
  children: ReactNode;
}) {
  const [studentDeltasByFlag, setStudentDeltasByFlag] = useImmer<
    Record<string, StudentDelta[]>
  >(() => buildInitialState(studentSubmissionsByFlag));

  const [activeFlag, setActiveFlag] = useQueryState<string>(
    "flag",
    createFlagParser(availableFlags.map((f) => f.id)).withDefault(
      availableFlags[0].id,
    ),
  );

  const unitIdsByFlag = useMemo(() => {
    const idk = availableFlags.map((f) => ({
      flag: f.id,
      data: studentSubmissionsByFlag[f.id][0].units.map((x) => x.unit.id),
    }));

    return keyBy(
      idk,
      (x) => x.flag,
      (x) => x.data,
    );
  }, [availableFlags, studentSubmissionsByFlag]);

  const selection = useSelectionState(studentDeltasByFlag[activeFlag].length);
  const {
    clearSelection,
    state: {
      unitIds: selectedUnitIds,
      studentIds: selectedStudentIds,
      mode: selectionMode,
    },
  } = selection;

  // clear selection when flag changes since the visible students/units change
  const setActiveFlagAndClearSelection = useCallback(
    (flagId: string) => {
      void setActiveFlag(flagId);
      clearSelection();
    },
    [clearSelection, setActiveFlag],
  );

  // --- single-row updaters

  const updateEnrolled = useCallback(
    (studentId: string, enrolled: boolean) => {
      setStudentDeltasByFlag((prev) => {
        const activeStudents = prev[activeFlag];
        const rowId = activeStudents.findIndex(
          (row) => row.studentId === studentId,
        );

        if (rowId === -1) {
          throw new Error("Tried to update unknown student");
        }

        const truth =
          studentSubmissionsByFlag[activeFlag][rowId].student.enrolled;

        activeStudents[rowId].enrolled =
          enrolled === truth ? undefined : enrolled;
      });
    },
    [setStudentDeltasByFlag, activeFlag, studentSubmissionsByFlag],
  );

  const updateUnit = useCallback(
    (
      studentId: string,
      unitId: string,
      patch: Partial<Omit<UnitDelta, "unitId">>,
    ) => {
      setStudentDeltasByFlag((prevRec) => {
        const activeStudents = prevRec[activeFlag];
        const studentRowId = activeStudents.findIndex(
          (row) => row.studentId === studentId,
        );

        if (studentRowId === -1) {
          throw new Error("Tried to update unknown student");
        }

        const units = activeStudents[studentRowId].units;
        const unitRowId = units.findIndex((u) => u.unitId === unitId);

        if (unitRowId === -1) {
          throw new Error("Tried to update unknown unit");
        }

        activeStudents[studentRowId].units[unitRowId] = {
          ...units[unitRowId],
          ...patch,
        };
      });
    },
    [setStudentDeltasByFlag, activeFlag],
  );

  // --- batch updater (now uses shared selection state)

  const batchUpdateUnits = useCallback(
    (patch: Partial<Omit<UnitDelta, "unitId">>) => {
      const visibleStudentIds = studentDeltasByFlag[activeFlag].map(
        (s) => s.studentId,
      );

      const affectedStudentIds =
        selectionMode === StudentSelectionMode.INCLUDE
          ? setIntersection(visibleStudentIds, selectedStudentIds, (x) => x)
          : setDiff(visibleStudentIds, selectedStudentIds, (x) => x);

      setStudentDeltasByFlag((prev) => {
        prev[activeFlag] = prev[activeFlag].map((row, i) => {
          if (!affectedStudentIds.includes(row.studentId)) return row;

          const studentSubmission = studentSubmissionsByFlag[activeFlag][i];

          return {
            ...row,
            units: row.units.map((u, j) =>
              // need to diff with truth to decide if we need to fill in this patch
              selectedUnitIds.includes(u.unitId)
                ? computeUnitDeltaFromPatch(
                    { ...u, ...patch },
                    studentSubmission.units[j].grade,
                  )
                : u,
            ),
          };
        });
      });
    },
    [
      studentDeltasByFlag,
      activeFlag,
      selectionMode,
      selectedStudentIds,
      setStudentDeltasByFlag,
      studentSubmissionsByFlag,
      selectedUnitIds,
    ],
  );

  // --- per-flag operations

  const resetFlag = useCallback(
    (flagId: string) => {
      setStudentDeltasByFlag((prev) => {
        prev[flagId] = studentSubmissionsByFlag[flagId].map(zeroDelta);
      });
    },
    [studentSubmissionsByFlag, setStudentDeltasByFlag],
  );

  const isDirty = useMemo(
    () => hasPendingChanges(studentDeltasByFlag[activeFlag]),
    [studentDeltasByFlag, activeFlag],
  );

  const dirtyFlags = useMemo(
    () =>
      new Set(
        availableFlags
          .map((f) => f.id)
          .filter((id) => hasPendingChanges(studentDeltasByFlag[id])),
      ),
    [availableFlags, studentDeltasByFlag],
  );

  // --- context value

  const value = useMemo<SubmissionsContextType>(
    () => ({
      studentDeltasByFlag,
      studentSubmissionsByFlag,
      unitIdsByFlag,
      availableFlags,
      activeFlag,
      setActiveFlag: setActiveFlagAndClearSelection,
      dirtyFlags,
      resetFlag,
      selection,
      updateEnrolled,
      updateUnit,
      batchUpdateUnits,
      isDirty,
    }),
    [
      studentDeltasByFlag,
      studentSubmissionsByFlag,
      unitIdsByFlag,
      availableFlags,
      activeFlag,
      setActiveFlagAndClearSelection,
      dirtyFlags,
      resetFlag,
      selection,
      updateEnrolled,
      updateUnit,
      batchUpdateUnits,
      isDirty,
    ],
  );

  return (
    <SubmissionsContext.Provider value={value}>
      {children}
    </SubmissionsContext.Provider>
  );
}
