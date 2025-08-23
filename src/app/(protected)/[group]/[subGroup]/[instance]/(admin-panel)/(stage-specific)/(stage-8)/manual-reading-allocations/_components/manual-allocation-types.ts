import {
  type StudentDTO,
  type ProjectDTO,
  type ReaderDTO,
  type SupervisorDTO,
} from "@/dto";

export type ReaderQuotaWarning = { message: string };

export type ManualReadingAllocationRow = {
  project: ProjectDTO;
  student: StudentDTO;
  supervisor: SupervisorDTO;
  originalReaderId?: string;
  selectedReaderId?: string;
  isDirty: boolean;
};

export type ManualReadingAllocationReader = ReaderDTO & {
  currentAllocations: number;
  pendingAllocations: number;
};

export type ReadingAllocationChanges = { readerId?: string };
