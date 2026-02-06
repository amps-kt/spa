import { z } from "zod";

/**
 * @deprecated
 */
export const MarkingSubmissionStatus = {
  /** Unit of assessment not yet open */
  CLOSED: "CLOSED",
  /** Unit of assessment open; no marking submission yet made */
  OPEN: "OPEN",
  /** non-final submission saved */
  DRAFT: "DRAFT",
  /** Unit is fully marked and submitted */
  SUBMITTED: "SUBMITTED",
} as const;

/**
 * @deprecated
 */
export const markingSubmissionStatusSchema = z.enum([
  MarkingSubmissionStatus.CLOSED,
  MarkingSubmissionStatus.OPEN,
  MarkingSubmissionStatus.DRAFT,
  MarkingSubmissionStatus.SUBMITTED,
]);

/**
 * @deprecated
 */
export type MarkingSubmissionStatus = z.infer<
  typeof markingSubmissionStatusSchema
>;
