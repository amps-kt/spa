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
  FIRST_OF_TWO: "FIRST_OF_TWO",
  SINGLE_MARKED: "SINGLE_MARKED",
  AUTO_RESOLVED: "AUTO_RESOLVED",
  NEGOTIATE1: "NEGOTIATE1",
  NEGOTIATE2: "NEGOTIATE2",
  MODERATE: "MODERATE",
} as const;

export type MarkSubmissionEvent = keyof typeof MarkSubmissionEvent;

export type AutoResolveResult =
  | { status: "AUTO_RESOLVED"; grade: number }
  | { status: Exclude<GradingResult, "AUTO_RESOLVED"> };

export type ModerationCheckResult =
  | { status: "AUTO_RESOLVED"; grade: number }
  | { status: "MODERATE" };

export type MarkSubmittedResult =
  | { status: "AUTO_RESOLVED"; grade: number }
  | { status: Exclude<MarkSubmissionEvent, "AUTO_RESOLVED"> };
