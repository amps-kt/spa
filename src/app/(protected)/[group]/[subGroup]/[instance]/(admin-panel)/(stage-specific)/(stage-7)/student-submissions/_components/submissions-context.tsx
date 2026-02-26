"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { z } from "zod";

import { type FlagDTO, type StudentDTO, type UnitOfAssessmentDTO } from "@/dto";

import { nubsById } from "@/lib/utils/list-unique";

export const customWeightValueSchema = z
  .number()
  .positive()
  .or(z.literal("MV"));

export type WeightValue = z.infer<typeof customWeightValueSchema>;

export type SelectionMode = "include" | "exclude";

// Data table rows contain general information about the student, all captures in the StudentDTO
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

  // --- derived from active filter

  /** Rows that match the current flag filter */
  visibleRows: StudentRowState[];

  /** Distinct UoA IDs across all visible rows */
  visibleUnitIds: string[];

  /** Distinct UoAs across all visible rows */
  visibleUnits: UnitOfAssessmentDTO[];

  /** Visible students */
  visibleStudents: StudentDTO[];

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
  batchUpdateUnits: (
    unitIds: string[],
    studentIds: string[],
    mode: "include" | "exclude",
    patch: Partial<Omit<UnitState, "unit">>,
  ) => void;

  // ---- change tracking ----

  /** Compute the set of fields that differ from the original server data */
  getPendingChanges: () => PendingChanges;

  /** Whether any row has been modified */
  isDirty: boolean;

  /** Reset all local state back to the original server data */
  resetAll: () => void;
}

const SubmissionsContext = createContext<SubmissionsContextType | null>(null);

export function useSubmissions() {
  const ctx = useContext(SubmissionsContext);
  if (!ctx) {
    throw new Error("useSubmissions must be used within a SubmissionsProvider");
  }
  return ctx;
}

export function useRowState(studentId: string): StudentRowState | undefined {
  const { rows } = useSubmissions();
  return rows.find((r) => r.student.id === studentId);
}

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
  const [originalData] = useState<StudentSubmissionsRow[]>(data);

  const availableFlags = useMemo(
    () => data.map((x) => x.student.flag).filter(nubsById),
    [data],
  );
  const [activeFlag, setActiveFlag] = useState<string>(availableFlags[0].id); // just have the first flag selected on page-load

  // --- derived visible data

  const visibleRows = useMemo(
    () => rows.filter((r) => r.student.flag.id === activeFlag),
    [rows, activeFlag],
  );

  const visibleUnits = useMemo(
    // because we only allow one flag to be selected at one time we only need to check one row
    () => visibleRows[0].units.map((x) => x.unit),
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

  // ---

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

  // ---

  const batchUpdateUnits = useCallback(
    (
      unitIds: string[],
      studentIds: string[],
      mode: "include" | "exclude", // initially had this as a boolean but I think this way is a bit cleaner at the call-site
      patch: Partial<Omit<UnitState, "unit">>,
    ) => {
      const unitIdSet = new Set(unitIds);
      const studentIdSet = new Set(studentIds);
      const visibleStudentIdSet = new Set(visibleStudents.map((s) => s.id));

      const affectedStudentIds =
        mode === "include"
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
    [visibleStudents],
  );

  // ---

  const getPendingChanges = useCallback((): PendingChanges => {
    const students: PendingStudentChange[] = [];
    const units: PendingUnitChange[] = [];

    rows.forEach((row, rowIdx) => {
      const originalRow = originalData[rowIdx];
      if (!originalRow) return;

      if (row.enrolled !== originalRow.student.enrolled) {
        students.push({ studentId: row.student.id, enrolled: row.enrolled });
      }

      row.units.forEach((u, unitIdx) => {
        const originalUnit = originalRow.unitsOfAssessment[unitIdx];
        if (!originalUnit) return;

        // I kinda hate this, but I think it's the cleanest way to do it
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
  }, [rows, originalData]);

  const isDirty = useMemo(() => {
    const { students, units } = getPendingChanges();
    return students.length > 0 || units.length > 0;
  }, [getPendingChanges]);

  const resetAll = useCallback(() => {
    setRows(buildInitialState(originalData));
  }, [originalData]);

  // ---

  const value = useMemo<SubmissionsContextType>(
    () => ({
      rows,
      availableFlags,
      activeFlag,
      setActiveFlag,
      visibleRows,
      visibleUnitIds,
      visibleUnits,
      visibleStudents,
      updateEnrolled,
      updateUnit,
      batchUpdateUnits,
      getPendingChanges,
      isDirty,
      resetAll,
    }),
    [
      rows,
      availableFlags,
      activeFlag,
      visibleRows,
      visibleUnitIds,
      visibleUnits,
      visibleStudents,
      updateEnrolled,
      updateUnit,
      batchUpdateUnits,
      getPendingChanges,
      isDirty,
      resetAll,
    ],
  );

  return (
    <SubmissionsContext.Provider value={value}>
      {children}
    </SubmissionsContext.Provider>
  );
}
