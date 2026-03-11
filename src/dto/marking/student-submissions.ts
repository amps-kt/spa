import { z } from "zod";

import {
  studentDtoSchema,
  unitGradeDtoSchema,
  unitOfAssessmentDtoSchema,
} from "..";

export const customWeightValueSchema = z.coerce
  .number<number>()
  .positive()
  .or(z.literal("MV"));

export type WeightValue = z.infer<typeof customWeightValueSchema>;

const studentSubmissionInfoDtoSchema = unitGradeDtoSchema.omit({
  grades: true,
  status: true,
});

export type StudentSubmissionInfoDTO = z.infer<
  typeof studentSubmissionInfoDtoSchema
>;

export const studentSubmissionsRowDtoSchema = z.object({
  student: studentDtoSchema,
  units: z.array(
    z.object({
      unit: unitOfAssessmentDtoSchema,
      submissionInfo: studentSubmissionInfoDtoSchema,
    }),
  ),
});

export type StudentSubmissionsRow = z.infer<
  typeof studentSubmissionsRowDtoSchema
>;

export const unitDeltaSchema = z.object({
  unitId: z.string(),
  submitted: z.boolean().optional(),
  customDueDate: z.date().optional(),
  customWeight: z.number().nonnegative().optional().nullable(),
});

export type UnitDelta = z.infer<typeof unitDeltaSchema>;

export const studentDeltaSchema = z.object({
  studentId: z.string(),
  enrolled: z.boolean().optional(),
  units: z.array(unitDeltaSchema),
});

export type StudentDelta = z.infer<typeof studentDeltaSchema>;
