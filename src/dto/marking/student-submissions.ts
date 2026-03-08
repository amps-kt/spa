import { z } from "zod";

import {
  studentDtoSchema,
  unitGradeDtoSchema__NEW,
  unitOfAssessmentDtoSchema,
} from "..";

export const customWeightValueSchema = z.coerce
  .number<number>()
  .positive()
  .or(z.literal("MV"));

export type WeightValue = z.infer<typeof customWeightValueSchema>;

export const studentSubmissionsRowDtoSchema = z.object({
  student: studentDtoSchema,
  units: z.array(
    z.object({
      unit: unitOfAssessmentDtoSchema,
      grade: unitGradeDtoSchema__NEW,
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
