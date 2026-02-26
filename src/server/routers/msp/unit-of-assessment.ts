import { Grade } from "@/logic/grading";
import { ConsensusMethod, ConsensusStage } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";

import {
  draftMarkingSubmissionDtoSchema,
  fullMarkingSubmissionDtoSchema,
  markOverrideDtoSchema,
  unitGradeDtoSchema,
  unitOfAssessmentDtoSchema,
} from "@/dto";
import { MarkSubmissionEvent } from "@/dto/result/grading-result";

import { procedure } from "../../middleware";
import { createTRPCRouter } from "../../trpc";

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
            fullMarkingSubmissionDtoSchema,
          ]),
        ),
      }),
    )
    .mutation(
      async ({ ctx: { unit }, input: { studentId } }) =>
        await unit.getMarks(studentId),
    ),

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
    .input(z.object({ data: fullMarkingSubmissionDtoSchema }))
    .mutation(
      async ({
        ctx: { user, instance, unit, mailer },
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

        await user.writeMarks(data);

        const student = await instance.getStudent(studentId);
        const { readerId, supervisorId } = await student.getMarkerIds();

        const { marks } = await unit.getMarks(studentId);

        const supervisorSubmission = marks[supervisorId];
        const readerSubmission = marks[readerId];

        const result = Grade.handleSubmission(
          allowedMarkerTypes,
          supervisorSubmission,
          readerSubmission,
        );

        if (result.status === MarkSubmissionEvent.SINGLE_MARKED) {
          await unit.updateFinalMark(studentId, {
            status: ConsensusStage.RESOLVED,
            method: ConsensusMethod.AUTO,
            comment: "",
            grade: result.grade,
          });

          // mailer.notifyMarkingComplete();

          return;
        }

        if (result.status === MarkSubmissionEvent.FIRST_OF_TWO) {
          // await unit.updateFinalMark(studentId, {status: ConsensusStage.UNRESOLVED}) // <- not necessary?
          // mailer.sendMarkingreceipt();

          return;
        }

        if (result.status === MarkSubmissionEvent.AUTO_RESOLVED) {
          await unit.updateFinalMark(studentId, {
            status: ConsensusStage.RESOLVED,
            method: ConsensusMethod.AUTO,
            comment: "",
            grade: result.grade,
          });
          // mailer.notifyMarkingComplete();

          return;
        }

        if (result.status === MarkSubmissionEvent.MODERATE) {
          await unit.updateFinalMark(studentId, {
            status: ConsensusStage.MODERATE,
          });
          // mailer.notifyModeration();

          return;
        }

        if (
          result.status === MarkSubmissionEvent.NEGOTIATE1 ||
          result.status === MarkSubmissionEvent.NEGOTIATE2
        ) {
          await unit.updateFinalMark(studentId, {
            status: ConsensusStage.NEGOTIATE,
          });
          // mailer.notifyNegotiate();

          return;
        }

        // assert_unreachable();
      },
    ),

  resolveNegotiation: procedure.unitOfAssessment.marker
    .input(z.object({ data: markOverrideDtoSchema }))
    .mutation(async ({ ctx: { unit }, input: { studentId, data } }) => {
      const result = Grade.handleNegotiationResolution(data.grade);

      if (result.status === MarkSubmissionEvent.AUTO_RESOLVED) {
        await unit.updateFinalMark(studentId, {
          status: ConsensusStage.RESOLVED,
          method: ConsensusMethod.NEGOTIATED,
          grade: result.grade,
          comment: data.justification,
        });
        // mailer.notifyMarkingComplete();

        return;
      }

      if (result.status === MarkSubmissionEvent.MODERATE) {
        await unit.updateFinalMark(studentId, {
          status: ConsensusStage.MODERATE,
        });
        // mailer.notifyModeration();

        return;
      }
    }),

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

  resetMarks: procedure.unitOfAssessment.subGroupAdmin.mutation(
    async ({ ctx: { unit } }) => {
      // unit.reset();
    },
  ),
});
