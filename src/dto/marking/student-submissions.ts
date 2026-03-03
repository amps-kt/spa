import { z } from "zod";

import {
  studentDtoSchema,
  unitGradeDtoSchema__NEW,
  unitOfAssessmentDtoSchema,
} from "..";

export const studentSubmissionsRowDtoSchema = z.object({
  student: studentDtoSchema,
  units: z.array(
    z.object({
      unit: unitOfAssessmentDtoSchema,
      grade: unitGradeDtoSchema__NEW,
    }),
  ),
});

export const unitDeltaSchema = z.object({
  unitId: z.string(),
  submitted: z.boolean().optional(),
  customDueDate: z.date().optional(),
  customWeight: z.number().nonnegative().optional().nullable(),
});

export const studentDeltaSchema = z.object({
  studentId: z.string(),
  enrolled: z.boolean().optional(),
  units: z.array(unitDeltaSchema),
});
