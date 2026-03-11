import { z } from "zod";

import { markerTypeSchema } from "@/db/types";

export const flagDtoSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  description: z.string(),
  layoutIndex: z.number(),
});

export type FlagDTO = z.infer<typeof flagDtoSchema>;

const componentDtoSchema = z.object({
  displayName: z.string(),
  description: z.string(),
  weight: z.number(),
});

const uoaDtoSchema = z.object({
  displayName: z.string(),
  description: z.string(),
  studentSubmissionDeadline: z.date(),
  markerSubmissionDeadline: z.date(),
  weight: z.number(),
  allowedMarkerTypes: z.array(markerTypeSchema),
  components: z.array(componentDtoSchema),
});

export const flagWithAssessmentDtoSchema = flagDtoSchema.extend({
  unitsOfAssessment: z.array(uoaDtoSchema).default([]),
});

export type FlagWithAssessmentDTO = z.infer<typeof flagWithAssessmentDtoSchema>;

export const tagDtoSchema = z.object({ id: z.string(), title: z.string() });

export type TagDTO = z.infer<typeof tagDtoSchema>;
