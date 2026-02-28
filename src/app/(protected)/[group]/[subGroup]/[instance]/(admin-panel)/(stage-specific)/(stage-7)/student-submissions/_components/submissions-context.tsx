"use client";

import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useQueryState, createParser } from "nuqs";
import { z } from "zod";

import { type FlagDTO, type StudentDTO, type UnitOfAssessmentDTO } from "@/dto";

import { nubsById } from "@/lib/utils/list-unique";

export const customWeightValueSchema = z.coerce
  .number<number>()
  .positive()
  .or(z.literal("MV"));

export type WeightValue = z.infer<typeof customWeightValueSchema>;

export type SelectionMode = "include" | "exclude";

// Data table rows contain general information about the student, all captured in the StudentDTO
// and information about the specific uoas they have to be graded on
// This is just the shape of the data as it gets returned from the server
export interface StudentSubmissionsRow {
  student: StudentDTO;
  unitsOfAssessment: {
    unit: UnitOfAssessmentDTO;
    submitted: boolean;
    customDueDate?: Date;
    customWeight?: WeightValue;
  }[];
}

// local mutable copy of student-level state - enrolled is lifted out of the DTO
// so we can update it without reconstructing the entire StudentDTO on every change
export interface StudentRowState {
  student: StudentDTO;
  enrolled: boolean;
  units: UnitState[];
}

// local mutable copy of unit-level state
export interface UnitState {
  unit: UnitOfAssessmentDTO;
  submitted: boolean;
  customDueDate?: Date;
  customWeight?: WeightValue;
}

// ---------------------------------------------------------

// Separating student-level and unit-level changes makes writing mutations easier:
// - PendingStudentChange[] maps to a studentDetails.updateMany (or two)
// - PendingUnitChange[] will require more granular changes (our mass upsert pattern)
export interface PendingChanges {
  students: PendingStudentChange[];
  units: PendingUnitChange[];
}

export interface PendingStudentChange {
  studentId: string;
  enrolled?: boolean;
}

export interface PendingUnitChange {
  studentId: string;
  unitId: string;
  submitted?: boolean;
  customDueDate?: Date;
  customWeight?: WeightValue;
}

// ----------------------------------------------------------

interface SubmissionsContextType {
  /** Current mutable state for every row */
  rows: StudentRowState[];

  // --- flag filtering

  /** All distinct flags present in the data */
  availableFlags: FlagDTO[];

  /** Currently active flag filter */
  activeFlag: string;

  /** Set the active flag filter */
  setActiveFlag: (flagId: string) => void;

  /** Which flag tabs currently have pending changes */
  dirtyFlags: Set<string>;

  // --- derived from active filter

  /** Rows that match the current flag filter */
  visibleRows: StudentRowState[];

  /** Distinct UoA IDs across all visible rows */
  visibleUnitIds: string[];

  /** Distinct UoAs across all visible rows */
  visibleUnits: UnitOfAssessmentDTO[];

  /** Visible students */
  visibleStudents: StudentDTO[];

  // --- selection (shared between filters and quick actions)

  /** Currently selected unit IDs */
  selectedUnitIds: string[];

  /** Set selected unit IDs */
  setSelectedUnitIds: (ids: string[]) => void;

  /** Currently selected student IDs */
  selectedStudentIds: string[];

  /** Set selected student IDs */
  setSelectedStudentIds: Dispatch<SetStateAction<string[]>>;

  /** Current selection mode */
  selectionMode: SelectionMode;

  /** Set selection mode (clears student selection on change) */
  setSelectionMode: (mode: SelectionMode) => void;

  /** Whether the current selection is valid for a quick action */
  hasValidSelection: boolean;

  // --- single-row updaters

  /** Update the enrolled status for a student */
  updateEnrolled: (studentId: string, enrolled: boolean) => void;

  /** Patch a specific unit for a specific student */
  updateUnit: (
    studentId: string,
    unitId: string,
    patch: Partial<Omit<UnitState, "unit">>,
  ) => void;

  // --- batch updaters

  /**
   * Apply a patch to specific units across multiple students.
   * Targets all visible students minus the excluded set.
   */
  batchUpdateUnits: (patch: Partial<Omit<UnitState, "unit">>) => void;

  // --- change tracking (per flag)

  /** Compute the set of fields that differ from the original server data */
  getPendingChangesForFlag: (flagId: string) => PendingChanges;

  /** Update the baseline data for the flag with the data just committed */
  commitFlag: (flagId: string) => void;

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

// ? maybe we should error if the find fails so we don't have to deal with the undefined case everywhere?
export function useRowState(studentId: string): StudentRowState | undefined {
  const { rows } = useSubmissions();
  return rows.find((r) => r.student.id === studentId);
}

// ------------------------------------------------------------ provider

function buildInitialState(data: StudentSubmissionsRow[]): StudentRowState[] {
  return data.map((row) => ({
    student: row.student,
    enrolled: row.student.enrolled,
    units: row.unitsOfAssessment.map((u) => ({
      unit: u.unit,
      submitted: u.submitted,
      customDueDate: u.customDueDate,
      customWeight: u.customWeight,
    })),
  }));
}

function hasPendingChangesForFlag(
  flagId: string,
  rows: StudentRowState[],
  originalData: StudentSubmissionsRow[],
): boolean {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const originalRow = originalData[i];
    if (!originalRow || row.student.flag.id !== flagId) continue;

    // student-level: enrolled
    if (row.enrolled !== originalRow.student.enrolled) return true;

    // unit-level
    for (let j = 0; j < row.units.length; j++) {
      const u = row.units[j];
      const ou = originalRow.unitsOfAssessment[j];
      if (!ou) continue;
      if (u.submitted !== ou.submitted) return true;
      if (u.customDueDate !== ou.customDueDate) return true;
      if (u.customWeight !== ou.customWeight) return true;
    }
  }

  return false;
}

export function SubmissionsProvider({
  data,
  children,
}: {
  data: StudentSubmissionsRow[];
  children: ReactNode;
}) {
  const [rows, setRows] = useState<StudentRowState[]>(() =>
    buildInitialState(data),
  );

  // stable reference to original data for diffing
  const [originalData, setOriginalData] =
    useState<StudentSubmissionsRow[]>(data);

  // --- flag filtering

  const availableFlags = useMemo(
    () => data.map((x) => x.student.flag).filter(nubsById),
    [data],
  );
  const [activeFlag, setActiveFlag] = useQueryState<string>(
    "flag",
    parseFlagId(availableFlags.map((f) => f.id)).withDefault(
      availableFlags[0].id,
    ),
  );

  // --- derived visible data

  const visibleRows = useMemo(
    () => rows.filter((r) => r.student.flag.id === activeFlag),
    [rows, activeFlag],
  );

  const visibleUnits = useMemo(
    // because we only allow one flag at a time we only need to check one row
    () => visibleRows[0]?.units.map((x) => x.unit) ?? [],
    [visibleRows],
  );

  const visibleUnitIds = useMemo(
    () => visibleUnits.map((u) => u.id),
    [visibleUnits],
  );

  const visibleStudents = useMemo(
    () => visibleRows.map((r) => r.student),
    [visibleRows],
  );

  // --- selection state

  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectionMode, setSelectionModeRaw] =
    useState<SelectionMode>("exclude");

  // clear student selection when mode changes to avoid stale selections
  const setSelectionMode = useCallback((mode: SelectionMode) => {
    setSelectionModeRaw(mode);
    setSelectedStudentIds([]);
  }, []);

  // clear selection when flag changes since the visible students/units change
  const setActiveFlagAndClearSelection = useCallback((flagId: string) => {
    setActiveFlag(flagId);
    setSelectedUnitIds([]);
    setSelectedStudentIds([]);
  }, []);

  const hasValidSelection = useMemo(() => {
    if (selectedUnitIds.length === 0) return false;
    if (selectionMode === "include" && selectedStudentIds.length === 0) {
      return false;
    }
    return true;
  }, [selectedUnitIds, selectedStudentIds, selectionMode]);

  // --- single-row updaters

  const updateEnrolled = useCallback((studentId: string, enrolled: boolean) => {
    setRows((prev) =>
      prev.map((row) =>
        row.student.id === studentId ? { ...row, enrolled } : row,
      ),
    );
  }, []);

  const updateUnit = useCallback(
    (
      studentId: string,
      unitId: string,
      patch: Partial<Omit<UnitState, "unit">>,
    ) => {
      setRows((prev) =>
        prev.map((row) => {
          if (row.student.id !== studentId) return row;
          return {
            ...row,
            units: row.units.map((u) =>
              u.unit.id === unitId ? { ...u, ...patch } : u,
            ),
          };
        }),
      );
    },
    [],
  );

  // --- batch updater (now uses shared selection state)

  const batchUpdateUnits = useCallback(
    (patch: Partial<Omit<UnitState, "unit">>) => {
      const unitIdSet = new Set(selectedUnitIds);
      const studentIdSet = new Set(selectedStudentIds);
      const visibleStudentIdSet = new Set(visibleStudents.map((s) => s.id));

      const affectedStudentIds =
        selectionMode === "include"
          ? visibleStudentIdSet.intersection(studentIdSet)
          : visibleStudentIdSet.difference(studentIdSet);

      setRows((prev) =>
        prev.map((row) => {
          if (!affectedStudentIds.has(row.student.id)) return row;

          return {
            ...row,
            units: row.units.map((u) =>
              unitIdSet.has(u.unit.id) ? { ...u, ...patch } : u,
            ),
          };
        }),
      );
    },
    [selectedUnitIds, selectedStudentIds, selectionMode, visibleStudents],
  );

  // --- per-flag operations

  const getPendingChangesForFlag = useCallback(
    (flagId: string): PendingChanges => {
      const students: PendingStudentChange[] = [];
      const units: PendingUnitChange[] = [];

      rows.forEach((row, rowIdx) => {
        if (row.student.flag.id !== flagId) return;
        const originalRow = originalData[rowIdx];
        if (!originalRow) return;

        if (row.enrolled !== originalRow.student.enrolled) {
          students.push({ studentId: row.student.id, enrolled: row.enrolled });
        }

        row.units.forEach((u, unitIdx) => {
          const originalUnit = originalRow.unitsOfAssessment[unitIdx];
          if (!originalUnit) return;

          const changes: Partial<PendingUnitChange> = {};
          let hasDiff = false;

          if (u.submitted !== originalUnit.submitted) {
            changes.submitted = u.submitted;
            hasDiff = true;
          }
          if (u.customDueDate !== originalUnit.customDueDate) {
            changes.customDueDate = u.customDueDate;
            hasDiff = true;
          }
          if (u.customWeight !== originalUnit.customWeight) {
            changes.customWeight = u.customWeight;
            hasDiff = true;
          }

          if (hasDiff) {
            units.push({
              studentId: row.student.id,
              unitId: u.unit.id,
              ...changes,
            });
          }
        });
      });

      return { students, units };
    },
    [rows, originalData],
  );

  const commitFlag = useCallback(
    (flagId: string) => {
      setOriginalData((prev) =>
        prev.map((orig, i) => {
          const row = rows[i];
          if (row.student.flag.id !== flagId) return orig;

          return {
            student: { ...row.student, enrolled: row.enrolled },
            unitsOfAssessment: row.units.map((u) => ({
              unit: u.unit,
              submitted: u.submitted,
              customDueDate: u.customDueDate,
              customWeight: u.customWeight,
            })),
          };
        }),
      );
    },
    [rows],
  );

  const resetFlag = useCallback(
    (flagId: string) => {
      setRows((prev) =>
        prev.map((row, i) => {
          if (row.student.flag.id !== flagId) return row;
          const orig = originalData[i];
          return {
            student: orig.student,
            enrolled: orig.student.enrolled,
            units: orig.unitsOfAssessment.map((u) => ({
              unit: u.unit,
              submitted: u.submitted,
              customDueDate: u.customDueDate,
              customWeight: u.customWeight,
            })),
          };
        }),
      );
    },
    [originalData],
  );

  const isDirty = useMemo(() => {
    const { students, units } = getPendingChangesForFlag(activeFlag);
    return students.length > 0 || units.length > 0;
  }, [getPendingChangesForFlag, activeFlag]);

  const dirtyFlags = useMemo(
    () =>
      new Set(
        availableFlags
          .map((f) => f.id)
          .filter((id) => hasPendingChangesForFlag(id, rows, originalData)),
      ),
    [availableFlags, rows, originalData],
  );

  // --- context value

  const value = useMemo<SubmissionsContextType>(
    () => ({
      rows,
      availableFlags,
      activeFlag,
      setActiveFlag: setActiveFlagAndClearSelection,
      dirtyFlags,
      getPendingChangesForFlag,
      commitFlag,
      resetFlag,
      visibleRows,
      visibleUnitIds,
      visibleUnits,
      visibleStudents,
      selectedUnitIds,
      setSelectedUnitIds,
      selectedStudentIds,
      setSelectedStudentIds,
      selectionMode,
      setSelectionMode,
      hasValidSelection,
      updateEnrolled,
      updateUnit,
      batchUpdateUnits,
      isDirty,
    }),
    [
      rows,
      availableFlags,
      activeFlag,
      setActiveFlagAndClearSelection,
      dirtyFlags,
      getPendingChangesForFlag,
      commitFlag,
      resetFlag,
      visibleRows,
      visibleUnitIds,
      visibleUnits,
      visibleStudents,
      selectedUnitIds,
      selectedStudentIds,
      selectionMode,
      setSelectionMode,
      hasValidSelection,
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

const parseFlagId = (validFlags: string[]) =>
  createParser({
    parse(queryValue) {
      const cleanVal = queryValue.trim().toLowerCase();
      return validFlags.includes(cleanVal) ? cleanVal : null;
    },
    serialize(value) {
      return value;
    },
  });
