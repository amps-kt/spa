import { z } from "zod";

import {
  projectDtoSchema,
  studentDtoSchema,
  unitOfAssessmentDtoSchema,
} from "@/dto";
import {
  studentGradingLifecycleStateSchema,
  unitGradingLifecycleStateSchema,
} from "@/dto/marking";

import { markerTypeSchema } from "@/db/types";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

export const newMarkerRouter = createTRPCRouter({
  getAssignedMarking: procedure.instance.marker
    .output(
      z
        .object({
          project: projectDtoSchema,
          student: studentDtoSchema,
          role: markerTypeSchema,
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
    .query(async ({ ctx: { user } }) => await user.getAssignedMarking()),
});
