import { TRPCError } from "@trpc/server";
import z from "zod";

import {
  draftMarkingSubmissionDtoSchema,
  markingSubmissionDtoSchema,
  unitGradeDtoSchema,
  unitOfAssessmentDtoSchema,
} from "@/dto";

import { procedure } from "../middleware";
import { createTRPCRouter } from "../trpc";

export const unitOfAssessmentRouter = createTRPCRouter({
  getMarks: procedure.unitOfAssessment.marker
    .output(
      z.object({
        unit: unitOfAssessmentDtoSchema,
        grade: unitGradeDtoSchema.optional(),
        marks: z.record(
          z.string(),
          z.discriminatedUnion("draft", [
            draftMarkingSubmissionDtoSchema,
            markingSubmissionDtoSchema,
          ]),
        ),
      }),
    )
    .mutation(async ({ ctx: { unit } }) => {
      return await unit.getMarks();
    }),

  getConsensus: procedure.unitOfAssessment.user
    .input(z.object({ studentId: z.string(), unitId: z.string() }))
    .output(z.object({ unitGrade: unitGradeDtoSchema }))
    .query(async ({ ctx: { instance }, input: { studentId, unitId } }) => {
      // TODO check if perm

      const student = await instance.getStudent(studentId);
      const unitGrade = await student.unitConsensus({ unitId });

      return { unitGrade };
    }),

  // [#22d3ee] - revisit middleware
  saveMarks: procedure.unitOfAssessment.marker
    .input(z.object({ data: draftMarkingSubmissionDtoSchema }))
    .mutation(
      async ({
        ctx: { unit, user, instance },
        input: { studentId, unitId, data },
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

        return await unit.writeMarks(data);
      },
    ),

  // [#22d3ee] - revisit middleware
  submitMarks: procedure.unitOfAssessment.marker
    .input(z.object({ data: markingSubmissionDtoSchema }))
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
