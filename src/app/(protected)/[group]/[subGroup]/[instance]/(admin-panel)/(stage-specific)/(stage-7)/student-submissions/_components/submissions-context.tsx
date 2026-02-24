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

import { type StudentDTO, type UnitOfAssessmentDTO } from "@/dto";

export const customWeightValueSchema = z
  .number()
  .positive()
  .or(z.literal("MV"));

export type WeightValue = z.infer<typeof customWeightValueSchema>;

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

// moving the enrolled field out makes the updaters nicer
export interface StudentRowState {
  student: StudentDTO;
  enrolled: boolean;
  units: UnitState[];
}

export interface UnitState {
  unit: UnitOfAssessmentDTO;
  submitted: boolean;
  customDueDate?: Date;
  customWeight?: WeightValue;
}

// this might be a bit weird but I think separating these out this way
// makes writing the mutations later a lot easier and doesn't
// - PendingStudentChange[] just gets passed to a studentDetails.updateMany (or possibly two)
// - PendingUnitChange[] is the nasty one which will require lots more very granular changes, though we can probably get away with a mass upsert (deleteMany + createMany)
export interface PendingChanges {
  students: PendingStudentChange[];
  units: PendingUnitChange[];
}

// this tracks per-student changes, the only thing we can change is whether the student is enrolled
export interface PendingStudentChange {
  studentId: string;
  enrolled?: boolean;
}

// this is for tracking the per-sub-row changes, everything is optional
export interface PendingUnitChange {
  studentId: string;
  unitId: string;
  submitted?: boolean;
  customDueDate?: Date;
  customWeight?: WeightValue;
}

interface SubmissionsContextType {
  /** Current mutable state for every row. */
  rows: StudentRowState[];

  /** Update the enrolled status for a student. */
  updateEnrolled: (studentId: string, enrolled: boolean) => void;

  /** Patch a specific unit for a specific student. */
  updateUnit: (
    studentId: string,
    unitId: string,
    patch: Partial<Omit<UnitState, "unit">>,
  ) => void;

  /** Compute the set of fields that differ from the original server data. */
  getPendingChanges: () => PendingChanges;

  /** Whether any row has been modified. */
  isDirty: boolean;

  /** Reset all local state back to the original server data. */
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

  // we keep a stable reference to the original data to make diffing easier
  const [originalData] = useState<StudentSubmissionsRow[]>(data);

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

  const getPendingChanges = useCallback((): PendingChanges => {
    const students: PendingStudentChange[] = [];
    const units: PendingUnitChange[] = [];

    rows.forEach((row, rowIdx) => {
      const originalRow = originalData[rowIdx];
      if (!originalRow) return;

      // student-level: enrolled
      if (row.enrolled !== originalRow.student.enrolled) {
        students.push({ studentId: row.student.id, enrolled: row.enrolled });
      }

      // unit-level
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
  }, [rows, originalData]);

  const isDirty = useMemo(() => {
    const { students, units } = getPendingChanges();
    return students.length > 0 || units.length > 0;
  }, [getPendingChanges]);

  const resetAll = useCallback(() => {
    setRows(buildInitialState(originalData));
  }, [originalData]);

  const value = useMemo<SubmissionsContextType>(
    () => ({
      rows,
      updateEnrolled,
      updateUnit,
      getPendingChanges,
      isDirty,
      resetAll,
    }),
    [rows, updateEnrolled, updateUnit, getPendingChanges, isDirty, resetAll],
  );

  return (
    <SubmissionsContext.Provider value={value}>
      {children}
    </SubmissionsContext.Provider>
  );
}
