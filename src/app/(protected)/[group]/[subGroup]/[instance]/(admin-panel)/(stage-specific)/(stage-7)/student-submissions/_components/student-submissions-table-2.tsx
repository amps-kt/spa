"use client";

import { useState } from "react";

import { type UnitOfAssessmentDTO, type StudentDTO } from "@/dto";

import { FlagCell } from "@/components/ui/data-table/cells/flag-cell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

import { DueDateCell } from "./cells/due-date-cell";
import { EnrolledCell } from "./cells/enrolled-cell";
import { SubmittedCell } from "./cells/submitted-cell";
import { WeightCell } from "./cells/weight-cell";

type WeightValue = number | "MV";

// The mutable per-unit state lives here so each row can track its own edits
// independently. In Stage 2 this is where you'd wire up server actions /
// optimistic updates.
interface UnitRowState {
  unit: UnitOfAssessmentDTO;
  submitted: boolean;
  customDueDate?: Date;
  customWeight?: WeightValue;
}

interface Row {
  student: StudentDTO;
  unitsOfAssessment: {
    unit: UnitOfAssessmentDTO;
    submitted: boolean;
    customDueDate?: Date;
    customWeight?: WeightValue;
  }[];
}

// ---------------------------------------------------------------------------
// Column widths
// ---------------------------------------------------------------------------

const columnWidths = {
  student: "min-w-[160px] max-w-[200px]",
  flag: "min-w-[80px] max-w-[110px]",
  units: "min-w-[150px] max-w-[190px]",
  weight: "min-w-[120px] max-w-[160px]",
  dueDate: "min-w-[150px] max-w-[190px]",
  submitted: "min-w-[110px] max-w-[145px]",
  enrolled: "min-w-[140px] max-w-[175px]",
};

const COLUMNS = [
  "student",
  "flag",
  "units",
  "weight",
  "dueDate",
  "submitted",
  "enrolled",
] as const;

// ---------------------------------------------------------------------------
// StudentRow — the "parent" row showing name / flag
// ---------------------------------------------------------------------------

function StudentRow({
  student,
  unitCount,
  onEnrolledChange,
}: {
  student: StudentDTO;
  unitCount: number;
  onEnrolledChange: (enrolled: boolean) => void;
}) {
  return (
    <TableRow>
      {/* Student */}
      <TableCell className={cn(columnWidths.student, "whitespace-normal")}>
        <div>
          <p className="font-semibold text-primary">{student.name}</p>
          <p className="text-xs text-muted-foreground">{student.id}</p>
          <p className="text-xs text-muted-foreground">{student.email}</p>
        </div>
      </TableCell>

      {/* Flag */}
      <TableCell className={columnWidths.flag}>
        <FlagCell flag={student.flag} />
      </TableCell>

      {/* Units of Assessment – empty in parent row */}
      <TableCell className={columnWidths.units} />

      {/* Weight – empty in parent row */}
      <TableCell className={columnWidths.weight} />

      {/* Due Date – empty in parent row */}
      <TableCell className={columnWidths.dueDate} />

      {/* Submitted? – empty in parent row */}
      <TableCell className={columnWidths.submitted} />

      {/* Enrolled? – shown once in the parent row, spans all unit rows */}
      <TableCell className={columnWidths.enrolled} rowSpan={unitCount + 1}>
        <EnrolledCell
          enrolled={student.enrolled}
          studentName={student.name}
          onChange={onEnrolledChange}
        />
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// UnitSubRow — one row per UoA
// ---------------------------------------------------------------------------

function UnitSubRow({
  unitState,
  onWeightChange,
  onDueDateChange,
  onSubmittedChange,
}: {
  unitState: UnitRowState;
  onWeightChange: (v: WeightValue) => void;
  onDueDateChange: (d: Date) => void;
  onSubmittedChange: (s: boolean) => void;
}) {
  const { unit, submitted, customDueDate, customWeight } = unitState;
  const displayWeight = customWeight ?? unit.weight;
  const displayDate = customDueDate ?? unit.studentSubmissionDeadline;

  return (
    <TableRow className="bg-muted/30">
      {/* Student – empty */}
      <TableCell className={columnWidths.student} />
      {/* Flag – empty */}
      <TableCell className={columnWidths.flag} />

      {/* Unit title */}
      <TableCell
        className={cn(columnWidths.units, "font-medium whitespace-normal")}
      >
        {unit.title}
      </TableCell>

      {/* Weight */}
      <TableCell className={columnWidths.weight}>
        <WeightCell value={displayWeight} onChange={onWeightChange} />
      </TableCell>

      {/* Due Date */}
      <TableCell className={columnWidths.dueDate}>
        <DueDateCell value={displayDate} onChange={onDueDateChange} />
      </TableCell>

      {/* Submitted? */}
      <TableCell className={columnWidths.submitted}>
        <SubmittedCell submitted={submitted} onChange={onSubmittedChange} />
      </TableCell>

      {/* Enrolled? – rendered via rowSpan in StudentRow, so no cell here */}
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// Per-student stateful block
// ---------------------------------------------------------------------------

function StudentBlock({ initialRow }: { initialRow: Row }) {
  const [enrolled, setEnrolled] = useState(initialRow.student.enrolled);
  const [units, setUnits] = useState<UnitRowState[]>(
    initialRow.unitsOfAssessment.map((u) => ({
      unit: u.unit,
      submitted: u.submitted,
      customDueDate: u.customDueDate,
      customWeight: u.customWeight,
    })),
  );

  function updateUnit(
    index: number,
    patch: Partial<Omit<UnitRowState, "unit">>,
  ) {
    setUnits((prev) =>
      prev.map((u, i) => (i === index ? { ...u, ...patch } : u)),
    );
  }

  return (
    <>
      <StudentRow
        student={{ ...initialRow.student, enrolled }}
        unitCount={units.length}
        onEnrolledChange={setEnrolled}
      />
      {units.map((unitState, i) => (
        <UnitSubRow
          key={unitState.unit.id}
          unitState={unitState}
          onWeightChange={(v) => updateUnit(i, { customWeight: v })}
          onDueDateChange={(d) => updateUnit(i, { customDueDate: d })}
          onSubmittedChange={(s) => updateUnit(i, { submitted: s })}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Header helper with optional info tooltip
// ---------------------------------------------------------------------------

function HeaderCell({
  label,
  className,
  tooltip,
}: {
  label: string;
  className?: string;
  tooltip?: string;
}) {
  if (tooltip) {
    return (
      <TableHead className={className}>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex cursor-default items-center gap-1">
                {label}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">{tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableHead>
    );
  }
  return <TableHead className={className}>{label}</TableHead>;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function StudentSubmissionsDataTable2({ data }: { data: Row[] }) {
  return (
    <div className="w-full rounded-md border border-accent dark:border-slate-600">
      <Table>
        <TableHeader>
          <TableRow>
            <HeaderCell label="Student" className={columnWidths.student} />
            <HeaderCell
              label="Flag"
              className={cn(columnWidths.flag, "text-center")}
            />
            <HeaderCell
              label="Units of Assessment"
              className={columnWidths.units}
            />
            <HeaderCell label="Weight" className={columnWidths.weight} />
            <HeaderCell
              label="Due Date"
              className={columnWidths.dueDate}
              tooltip="Student submission deadline. Click a date in a row to override it."
            />
            <HeaderCell label="Submitted?" className={columnWidths.submitted} />
            <HeaderCell label="Enrolled?" className={columnWidths.enrolled} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <StudentBlock key={row.student.id} initialRow={row} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
