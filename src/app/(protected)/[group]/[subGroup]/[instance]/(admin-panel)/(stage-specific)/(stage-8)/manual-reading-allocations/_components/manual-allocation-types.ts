import {
  type StudentDTO,
  type ProjectDTO,
  type ReaderDTO,
  type SupervisorDTO,
} from "@/dto";

export const ValidationWarningType = {
  /** Allocating to this Reader will exceed their reading workload quota */
  EXCEEDS_READING_QUOTA: "exceeds-reading-quota",
} as const;

export type ValidationWarningType =
  (typeof ValidationWarningType)[keyof typeof ValidationWarningType];

export const ValidationWarningSeverity = {
  WARNING: "warning",
  ERROR: "error",
} as const;

export type ValidationWarningSeverity =
  (typeof ValidationWarningSeverity)[keyof typeof ValidationWarningSeverity];

export type ValidationWarning = {
  type: ValidationWarningType;
  message: string;
  severity: ValidationWarningSeverity;
};

// Types for reading allocations
export type ManualReadingAllocationRow = {
  project: ProjectDTO;
  supervisor: SupervisorDTO;
  student: StudentDTO;
  originalReaderId?: string;
  selectedReaderId?: string;

  isDirty: boolean;
  warnings: ValidationWarning[];
};

export type ManualReadingAllocationReader = ReaderDTO & {
  currentAllocations: number;
  pendingAllocations: number;
};

export type ReadingAllocationChanges = { readerId?: string };
