import { z } from "zod";

import {
  MarkerType,
  markingMethodSchema,
  rawUnitMarkingStatusSchema,
} from "@/db/types";

import { flagDtoSchema } from "./flag-tag";

// --- markscheme stuff:

export const assessmentCriterionDtoSchema = z.object({
  id: z.string(),
  unitOfAssessmentId: z.string(),
  title: z.string(),
  description: z.string(),
  weight: z.number(),
  layoutIndex: z.number(),
});

export type AssessmentCriterionDTO = z.infer<
  typeof assessmentCriterionDtoSchema
>;

export const unitOfAssessmentDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  studentSubmissionDeadline: z.date(),
  markerSubmissionDeadline: z.date(),
  weight: z.number(),
  isOpen: z.boolean(),
  components: z.array(assessmentCriterionDtoSchema),
  flag: flagDtoSchema,
  allowedMarkerTypes: z.array(z.enum(MarkerType)),
});

export type UnitOfAssessmentDTO = z.infer<typeof unitOfAssessmentDtoSchema>;

export const newUnitOfAssessmentSchema = z.object({
  title: z.string(),
  studentSubmissionDeadline: z.date(),
  markerSubmissionDeadline: z.date(),
  weight: z.number(),
  isOpen: z.boolean(),
  allowedMarkerTypes: z
    .union([z.literal("SUPERVISOR"), z.literal("READER")])
    .array(),
  components: z.array(
    z.object({
      title: z.string(),
      weight: z.number(),
      description: z.string(),
      layoutIndex: z.number(),
    }),
  ),
});

export type NewUnitOfAssessmentDTO = z.infer<typeof newUnitOfAssessmentSchema>;

// --- mark submission/grade stuff

export const componentScoreDtoSchema = z.object({
  mark: z.number().int().nonnegative(),
  justification: z.string().min(1),
});

export type ComponentScoreDTO = z.infer<typeof componentScoreDtoSchema>;

export const markingSubmissionDtoSchema = z.object({
  grade: z.number().int().nonnegative(),
  finalComment: z.string(),
  recommendation: z.boolean(),
  draft: z.boolean(),
  markerId: z.string(),
  studentId: z.string(),
  unitOfAssessmentId: z.string(),
  marks: z.record(
    z.string(), // assessmentCriterionId
    componentScoreDtoSchema,
  ),
});

export type MarkingSubmissionDTO = z.infer<typeof markingSubmissionDtoSchema>;

export const partialMarkingSubmissionDtoSchema = markingSubmissionDtoSchema
  .partial({ finalComment: true, recommendation: true })
  .extend({
    grade: z.number().int(),
    marks: z
      .record(
        z.string(), // assessmentCriterionId
        z
          .object({ mark: z.number().int(), justification: z.string() })
          .partial(),
      )
      .optional(),
  });

export type PartialMarkingSubmissionDTO = z.infer<
  typeof partialMarkingSubmissionDtoSchema
>;

export const unitGradeDtoSchema = z.object({
  grade: z.number(),
  comment: z.string(),
  status: rawUnitMarkingStatusSchema,
  method: markingMethodSchema,
  studentSubmitted: z.boolean(),
  customDueDate: z.date().optional(),
  customWeight: z.number().optional(),
});

export type UnitGradeDTO = z.infer<typeof unitGradeDtoSchema>;

export const UnitGradingLifecycleState = {
  CLOSED: "CLOSED",
  NOT_SUBMITTED: "NOT_SUBMITTED",
  REQUIRES_MARKING: "REQUIRES_MARKING",
  IN_NEGOTIATION: "IN_NEGOTIATION",
  IN_MODERATION: "IN_MODERATION",
  PENDING_2ND_MARKER: "PENDING_2ND_MARKER",
  DONE: "DONE",
  AUTO_RESOLVED: "AUTO_RESOLVED",
  RESOLVED_BY_NEGOTIATION: "RESOLVED_BY_NEGOTIATION",
  RESOLVED_BY_MODERATION: "RESOLVED_BY_MODERATION",
} as const;

export type UnitGradingLifecycleState = keyof typeof UnitGradingLifecycleState;

export const unitGradingLifecycleStateSchema = z.enum([
  UnitGradingLifecycleState.CLOSED,
  UnitGradingLifecycleState.NOT_SUBMITTED,
  UnitGradingLifecycleState.REQUIRES_MARKING,
  UnitGradingLifecycleState.IN_NEGOTIATION,
  UnitGradingLifecycleState.IN_MODERATION,
  UnitGradingLifecycleState.PENDING_2ND_MARKER,
  UnitGradingLifecycleState.DONE,
  UnitGradingLifecycleState.AUTO_RESOLVED,
  UnitGradingLifecycleState.RESOLVED_BY_NEGOTIATION,
  UnitGradingLifecycleState.RESOLVED_BY_MODERATION,
]);

export const StudentGradingLifecycleState = {
  DONE: "DONE",
  NOT_SUBMITTED: "NOT_SUBMITTED",
  CLOSED: "CLOSED",
  PENDING: "PENDING",
  ACTION_REQUIRED: "ACTION_REQUIRED",
} as const;

export type StudentGradingLifecycleState =
  keyof typeof StudentGradingLifecycleState;

export const studentGradingLifecycleStateSchema = z.enum([
  StudentGradingLifecycleState.DONE,
  StudentGradingLifecycleState.NOT_SUBMITTED,
  StudentGradingLifecycleState.CLOSED,
  StudentGradingLifecycleState.PENDING,
  StudentGradingLifecycleState.ACTION_REQUIRED,
]);

export function unitToOverall(
  stat: UnitGradingLifecycleState,
): StudentGradingLifecycleState {
  const rec: Record<UnitGradingLifecycleState, StudentGradingLifecycleState> = {
    [UnitGradingLifecycleState.CLOSED]: StudentGradingLifecycleState.CLOSED,
    [UnitGradingLifecycleState.NOT_SUBMITTED]:
      StudentGradingLifecycleState.NOT_SUBMITTED,
    [UnitGradingLifecycleState.REQUIRES_MARKING]:
      StudentGradingLifecycleState.ACTION_REQUIRED,
    [UnitGradingLifecycleState.IN_NEGOTIATION]:
      StudentGradingLifecycleState.ACTION_REQUIRED,
    [UnitGradingLifecycleState.IN_MODERATION]:
      StudentGradingLifecycleState.PENDING,
    [UnitGradingLifecycleState.PENDING_2ND_MARKER]:
      StudentGradingLifecycleState.PENDING,
    [UnitGradingLifecycleState.DONE]: StudentGradingLifecycleState.DONE,
    [UnitGradingLifecycleState.AUTO_RESOLVED]:
      StudentGradingLifecycleState.DONE,
    [UnitGradingLifecycleState.RESOLVED_BY_NEGOTIATION]:
      StudentGradingLifecycleState.DONE,
    [UnitGradingLifecycleState.RESOLVED_BY_MODERATION]:
      StudentGradingLifecycleState.DONE,
  };

  return rec[stat];
}

export function markingStatusCompare(
  a: StudentGradingLifecycleState,
  b: StudentGradingLifecycleState,
): StudentGradingLifecycleState {
  const rec: Record<StudentGradingLifecycleState, number> = {
    CLOSED: 4,
    DONE: 3,
    NOT_SUBMITTED: 2,
    PENDING: 1,
    ACTION_REQUIRED: 0,
  };

  return rec[a] < rec[b] ? a : b;
}

export function markingStatusMin(
  s: StudentGradingLifecycleState[],
): StudentGradingLifecycleState {
  return s.reduce(
    markingStatusCompare,
    StudentGradingLifecycleState.ACTION_REQUIRED,
  );
}
