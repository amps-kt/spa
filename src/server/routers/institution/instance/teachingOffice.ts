import { z } from "zod";

import {
  studentDtoSchema,
  unitOfAssessmentDtoSchema,
  unitGradeDtoSchema,
  type UnitGradeDTO,
} from "@/dto";
import {
  studentDeltaSchema,
  studentSubmissionsRowDtoSchema,
} from "@/dto/marking/student-submissions";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

export const teachingOfficeRouter = createTRPCRouter({
  getFlagStudentSubmissionInfo: procedure.instance.subGroupAdmin
    .input(z.object({ flagId: z.string() }))
    .output(
      z.object({
        flagId: z.string(),
        data: z.array(studentSubmissionsRowDtoSchema),
      }),
    )
    .query(async ({ ctx: { instance }, input: { flagId } }) => ({
      flagId,
      data: await instance.getStudentUnitSubmissionsByFlag(flagId),
    })),

  updateStudentSubmissionInfo: procedure.instance.subGroupAdmin
    .input(z.object({ studentDeltas: z.array(studentDeltaSchema) }))
    .output(z.void())
    .mutation(
      async ({ ctx: { instance }, input: { studentDeltas } }) =>
        await instance.updateStudentSubmissionInfo(studentDeltas),
    ),
});
