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
// --- new:

export const UnitMarkingStatus = {
  CLOSED: "CLOSED",
  NOT_SUBMITTED: "NOT_SUBMITTED",
  REQUIRES_MARKING: "REQUIRES_MARKING",
  IN_NEGOTIATION: "IN_NEGOTIATION",
  IN_MODERATION: "IN_MODERATION",
  PENDING_2ND_MARKER: "PENDING_2ND_MARKER",
  DONE: "DONE",
  AUTO_RESOLVED: "AUTO_RESOLVED",
  NEGOTIATED: "NEGOTIATED",
  MODERATED: "MODERATED",
} as const;

export type UnitMarkingStatus = keyof typeof UnitMarkingStatus;

export const unitMarkingStatusSchema = z.enum([
  UnitMarkingStatus.CLOSED,
  UnitMarkingStatus.NOT_SUBMITTED,
  UnitMarkingStatus.REQUIRES_MARKING,
  UnitMarkingStatus.IN_NEGOTIATION,
  UnitMarkingStatus.IN_MODERATION,
  UnitMarkingStatus.PENDING_2ND_MARKER,
  UnitMarkingStatus.DONE,
  UnitMarkingStatus.AUTO_RESOLVED,
  UnitMarkingStatus.NEGOTIATED,
  UnitMarkingStatus.MODERATED,
]);

export const OverallMarkingStatus = {
  DONE: "DONE",
  NOT_SUBMITTED: "NOT_SUBMITTED",
  CLOSED: "CLOSED",
  PENDING: "PENDING",
  ACTION_REQUIRED: "ACTION_REQUIRED",
} as const;

export type OverallMarkingStatus = keyof typeof OverallMarkingStatus;

export const overallMarkingStatusSchema = z.enum([
  OverallMarkingStatus.DONE,
  OverallMarkingStatus.NOT_SUBMITTED,
  OverallMarkingStatus.CLOSED,
  OverallMarkingStatus.PENDING,
  OverallMarkingStatus.ACTION_REQUIRED,
]);

export function unitToOverall(stat: UnitMarkingStatus): OverallMarkingStatus {
  const rec: Record<UnitMarkingStatus, OverallMarkingStatus> = {
    [UnitMarkingStatus.CLOSED]: OverallMarkingStatus.CLOSED,
    [UnitMarkingStatus.NOT_SUBMITTED]: OverallMarkingStatus.NOT_SUBMITTED,
    [UnitMarkingStatus.REQUIRES_MARKING]: OverallMarkingStatus.ACTION_REQUIRED,
    [UnitMarkingStatus.IN_NEGOTIATION]: OverallMarkingStatus.ACTION_REQUIRED,
    [UnitMarkingStatus.IN_MODERATION]: OverallMarkingStatus.PENDING,
    [UnitMarkingStatus.PENDING_2ND_MARKER]: OverallMarkingStatus.PENDING,
    [UnitMarkingStatus.DONE]: OverallMarkingStatus.DONE,
    [UnitMarkingStatus.AUTO_RESOLVED]: OverallMarkingStatus.DONE,
    [UnitMarkingStatus.NEGOTIATED]: OverallMarkingStatus.DONE,
    [UnitMarkingStatus.MODERATED]: OverallMarkingStatus.DONE,
  };

  return rec[stat];
}

export function markingStatusCompare(
  a: OverallMarkingStatus,
  b: OverallMarkingStatus,
): OverallMarkingStatus {
  const rec: Record<OverallMarkingStatus, number> = {
    CLOSED: 4,
    DONE: 3,
    NOT_SUBMITTED: 2,
    PENDING: 1,
    ACTION_REQUIRED: 0,
  };

  return rec[a] < rec[b] ? a : b;
}

export function markingStatusMin(
  s: OverallMarkingStatus[],
): OverallMarkingStatus {
  return s.reduce(markingStatusCompare, OverallMarkingStatus.ACTION_REQUIRED);
}
