import { z } from "zod";

export const MarkingProgress = {
  /** Unit of assessment not yet open */
  CLOSED: "CLOSED",
  /** Unit of assessment open; no marking submission yet made */
  NOT_STARTED: "NOT_STARTED",
  /** non-final submission saved */
  IN_PROGRESS: "IN_PROGRESS",
  /** Unit is fully marked and submitted */
  COMPLETE: "COMPLETE",
} as const;

export const markingProgressSchema = z.enum([
  MarkingProgress.CLOSED,
  MarkingProgress.NOT_STARTED,
  MarkingProgress.IN_PROGRESS,
  MarkingProgress.COMPLETE,
]);

export type MarkingProgress = z.infer<typeof markingProgressSchema>;
