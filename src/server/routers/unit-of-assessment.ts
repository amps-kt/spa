import { TRPCError } from "@trpc/server";
import z from "zod";

import { procedure } from "../middleware";
import { createTRPCRouter } from "../trpc";

export const unitOfAssessmentRouter = createTRPCRouter({
  getMarks: procedure.unitOfAssessment.marker.mutation(
    async ({ ctx: { unit } }) => {
      return await unit.getMarks();
    },
  ),

  saveMarks: procedure.unitOfAssessment.marker
    .input(
      z.object({
        data: z.object({
          grade: z.number().optional(),
          finalComment: z.string().optional(),
          recommendation: z.boolean().optional(),
          marks: z.record(
            z.string(),
            z.object({
              mark: z.number().optional(),
              justification: z.string().optional(),
            }),
          ),
        }),
      }),
    )
    .mutation(
      async ({
        ctx: { user, instance },
        input: {
          studentId,
          unitId,
          data: { finalComment, grade, recommendation, marks },
        },
      }) => {
        const markerType = await user.getMarkerType(studentId);
        const { allowedMarkerTypes } =
          await instance.getUnitOfAssessment(unitId);

        if (!allowedMarkerTypes.includes(markerType)) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User is not correct marker type",
          });
        }

        return await user.writeMarks({
          unitOfAssessmentId: unitId,
          studentId,
          draft: true,
          recommendation,
          finalComment,
          grade,
          marks,
        });
      },
    ),

  submitMarks: procedure.unitOfAssessment.marker
    .input(
      z.object({
        data: z.object({
          grade: z.number(),
          finalComment: z.string(),
          recommendation: z.boolean(),
          marks: z.record(
            z.string(),
            z.object({ mark: z.number(), justification: z.string() }),
          ),
        }),
      }),
    )
    .mutation(
      async ({
        ctx: { user, instance },
        input: {
          studentId,
          unitId,
          data: { finalComment, grade, recommendation, marks },
        },
      }) => {
        const markerType = await user.getMarkerType(studentId);
        const { allowedMarkerTypes } =
          await instance.getUnitOfAssessment(unitId);

        if (!allowedMarkerTypes.includes(markerType)) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User is not correct marker type",
          });
        }

        await user.writeMarks({
          unitOfAssessmentId: unitId,
          studentId,
          draft: false,
          recommendation,
          finalComment,
          grade,
          marks,
        });

        // Grading.decideWhatsNext();
        // dispatch
      },
    ),

  resolveNegotiation: procedure.unitOfAssessment.marker.mutation(
    async ({ ctx: { unit } }) => {},
  ),

  resolveModeration: procedure.unitOfAssessment.subGroupAdmin.mutation(
    async ({ ctx: { unit } }) => {},
  ),

  resetMarks: procedure.unitOfAssessment.subGroupAdmin.mutation(
    async ({ ctx: { unit } }) => {
      // unit.reset();
    },
  ),
});
