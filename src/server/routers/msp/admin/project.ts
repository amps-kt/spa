import z from "zod";

import {
  projectDtoSchema,
  readerDtoSchema,
  studentDtoSchema,
  supervisorDtoSchema,
  unitOfAssessmentDtoSchema,
} from "@/dto";
import {
  studentGradingLifecycleStateSchema,
  unitGradingLifecycleStateSchema,
} from "@/dto/marking";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

export const projectRouter = createTRPCRouter({
  getStatusData: procedure.instance.subGroupAdmin
    .input(z.object({ flagId: z.string() }))
    .output(
      z
        .object({
          project: projectDtoSchema,
          student: studentDtoSchema,
          supervisor: supervisorDtoSchema,
          reader: readerDtoSchema,
          status: studentGradingLifecycleStateSchema,
          units: z
            .object({
              unit: unitOfAssessmentDtoSchema,
              status: unitGradingLifecycleStateSchema,
            })
            .array(),
        })
        .array(),
    )
    .query(
      async ({ ctx: { instance }, input: { flagId } }) =>
        await instance.getMarkingStatusInfo(flagId),
    ),
});
