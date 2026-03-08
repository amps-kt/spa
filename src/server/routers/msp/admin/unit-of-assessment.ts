import z from "zod";

import { markOverrideDtoSchema } from "@/dto";

import { ConsensusMethod, ConsensusStage } from "@/db/types";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

export const unitOfAssessmentRouter = createTRPCRouter({
  resolveModeration: procedure.unitOfAssessment.subGroupAdmin
    .input(z.object({ data: markOverrideDtoSchema }))
    .mutation(async ({ ctx: { unit }, input: { studentId, data } }) => {
      await unit.updateFinalMark(studentId, {
        status: ConsensusStage.RESOLVED,
        method: ConsensusMethod.MODERATED,
        comment: data.justification,
        grade: data.grade,
      });

      // mailer.notifyMarkingComplete();

      return;
    }),

  // TODO hook this up
  // Low priority feature
  overrideMark: procedure.unitOfAssessment.subGroupAdmin
    .input(z.object({ data: markOverrideDtoSchema }))
    .mutation(async ({ ctx: { unit }, input: { studentId, data } }) => {
      await unit.updateFinalMark(studentId, {
        status: ConsensusStage.RESOLVED,
        method: ConsensusMethod.OVERRIDE,
        comment: data.justification,
        grade: data.grade,
      });
    }),

  resetMarks: procedure.unitOfAssessment.subGroupAdmin
    .input(z.object({ markerId: z.string(), studentId: z.string() }))
    .mutation(async ({ ctx: { unit }, input: { markerId, studentId } }) => {
      await unit.resetMarks({ markerId, studentId });

      // mailer.notifyMarkingReset()
    }),
});
