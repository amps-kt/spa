import z from "zod";

import {
  projectDtoSchema,
  readerDtoSchema,
  studentDtoSchema,
  studentGradingLifecycleStateSchema,
  supervisorDtoSchema,
  unitGradingLifecycleStateSchema,
  unitOfAssessmentDtoSchema,
} from "@/dto";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

export const mspAdminInstanceRouter = createTRPCRouter({
  getStudentMarkingStatus: procedure.instance.subGroupAdmin
    .output(
      z.array(
        z.object({
          project: projectDtoSchema,
          student: studentDtoSchema,
          status: studentGradingLifecycleStateSchema,
          units: z.array(
            z.object({
              unit: unitOfAssessmentDtoSchema,
              status: unitGradingLifecycleStateSchema,
            }),
          ),
          reader: readerDtoSchema.optional(),
          supervisor: supervisorDtoSchema,
        }),
      ),
    )
    .query(
      async ({ ctx: { instance } }) => await instance.getStudentMarkingStatus(),
    ),
});
