import { z } from "zod";

export const GradingResult = {
  /** Marking process could be resolved automatically */
  AUTO_RESOLVED: "AUTO_RESOLVED",
  /** Marking process requires moderator intervention */
  MODERATE: "MODERATE",
  /** Marking delta of 2; nearly in agreement */
  NEGOTIATE1: "NEGOTIATE1",
  /** Large marking delta */
  NEGOTIATE2: "NEGOTIATE2",
} as const;

export const GradingResultSchema = z.enum([
  GradingResult.AUTO_RESOLVED,
  GradingResult.MODERATE,
  GradingResult.NEGOTIATE1,
  GradingResult.NEGOTIATE2,
]);

export type GradingResult = z.infer<typeof GradingResultSchema>;

export const MarkSubmissionEvent = {
  /** This is a double marked unit, and the second marker has not yet submitted their marks. */
  FIRST_OF_TWO: "FIRST_OF_TWO",
  /** This is a single marked unit - this is now done. */
  SINGLE_MARKED: "SINGLE_MARKED",
  /** Marks for this unit were close enough to resolve automatically */
  AUTO_RESOLVED: "AUTO_RESOLVED",
  /** Marking delta of 2; nearly in agreement but cannot auto-resolve*/
  NEGOTIATE1: "NEGOTIATE1",
  /** Large marking delta; cannot auto-resolve */
  NEGOTIATE2: "NEGOTIATE2",
  /** Marking process requires moderator intervention */
  MODERATE: "MODERATE",
} as const;

export type MarkSubmissionEvent = keyof typeof MarkSubmissionEvent;

export type AutoResolveResult =
  | { status: typeof MarkSubmissionEvent.AUTO_RESOLVED; grade: number }
  | {
      status: Exclude<GradingResult, typeof MarkSubmissionEvent.AUTO_RESOLVED>;
    };

export type MarkSubmissionEventResult =
  | { status: typeof MarkSubmissionEvent.AUTO_RESOLVED; grade: number }
  | { status: typeof MarkSubmissionEvent.SINGLE_MARKED; grade: number }
  | {
      status: Exclude<
        MarkSubmissionEvent,
        | typeof MarkSubmissionEvent.AUTO_RESOLVED
        | typeof MarkSubmissionEvent.SINGLE_MARKED
      >;
    };

export type ModerationCheckResult =
  | { status: "AUTO_RESOLVED"; grade: number }
  | { status: "MODERATE" };
