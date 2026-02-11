import { z } from "zod";

import {
  projectDtoSchema,
  studentDtoSchema,
  unitOfAssessmentDtoSchema,
} from "@/dto";
import {
  overallMarkingStatusSchema,
  unitMarkingStatusSchema,
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
          status: overallMarkingStatusSchema,
          units: z
            .object({
              unit: unitOfAssessmentDtoSchema,
              status: unitMarkingStatusSchema,
            })
            .array(),
        })
        .array(),
    )
    .query(async ({ ctx: { user } }) => await user.getAssignedMarking()),
});
