import { Grade } from "@/logic/grading";
import { TRPCError } from "@trpc/server";
import z from "zod";

import {
  draftMarkingSubmissionDtoSchema,
  fullMarkingSubmissionDtoSchema,
  markingSubmissionDtoSchema,
  markOverrideDtoSchema,
  unitGradeDtoSchema,
  unitOfAssessmentDtoSchema,
} from "@/dto";
import { MarkSubmissionEvent } from "@/dto/result/grading-result";

import { ConsensusMethod, ConsensusStage } from "@/db/types";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

export const unitOfAssessmentRouter = createTRPCRouter({
  getMarks: procedure.unitOfAssessment.marker
    .output(
      z.object({
        unit: unitOfAssessmentDtoSchema,
        grade: unitGradeDtoSchema.optional(),
        marks: z.record(z.string(), markingSubmissionDtoSchema),
      }),
    )
    .query(
      async ({ ctx: { unit }, input: { studentId } }) =>
        await unit.getMarks(studentId),
    ),

  // msp/marker/unit getMarksByMarkerId
  getMarksByMarkerId: procedure.instance.user
    .input(
      z.object({
        studentId: z.string(),
        markerId: z.string(),
        unitId: z.string(),
      }),
    )
    .output(markingSubmissionDtoSchema.optional())
    .query(
      async ({ ctx: { instance }, input: { studentId, markerId, unitId } }) => {
        const student = await instance.getStudent(studentId);

        return await student.getMarkerMarksByUnitId({ markerId, unitId });
      },
    ),

  getConsensus: procedure.unitOfAssessment.marker
    .input(z.object({ studentId: z.string(), unitId: z.string() }))
    .output(unitGradeDtoSchema)
    .query(
      async ({
        ctx: { instance, user },
        input: { studentId, unitId, params },
      }) => {
        const isAdmin = await user.isSubGroupAdminOrBetter(params);
        const markerType = await user.getMarkerType(studentId);
        const { allowedMarkerTypes } =
          await instance.getUnitOfAssessment(unitId);

        if (!allowedMarkerTypes.includes(markerType) && !isAdmin) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User is not correct marker type",
          });
        }

        const student = await instance.getStudent(studentId);
        const unitGrade = await student.getUnitGrade({ unitId });

        return unitGrade;
      },
    ),

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
  // [#c2410c] - transactions
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

        await unit.writeMarks(data);

        const student = await instance.getStudent(studentId);
        const { readerId, supervisorId } = await student.getMarkerIds();

        const { marks } = await unit.getMarks(studentId);

        const supervisorSubmission = marks[supervisorId];
        const readerSubmission =
          readerId === undefined ? undefined : marks[readerId];

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
          await unit.updateFinalMark(studentId, {
            status: ConsensusStage.UNRESOLVED,
          });
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
});
