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

import { ConsensusMethod, ConsensusStage, MarkerType } from "@/db/types";

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
    .output(markingSubmissionDtoSchema.or(z.null()))
    .query(
      async ({ ctx: { instance }, input: { studentId, markerId, unitId } }) => {
        const student = await instance.getStudent(studentId);

        return (
          // I don't like this, let's wrap it in a bobject spacesuit
          (await student.getMarkerMarksByUnitId({ markerId, unitId })) ?? null
        );
      },
    ),

  // [#22d3ee] - revisit middleware
  getConsensus: procedure.unitOfAssessment.user
    .input(z.object({ studentId: z.string(), unitId: z.string() }))
    .output(unitGradeDtoSchema)
    .query(
      async ({
        ctx: { instance, user },
        input: { studentId, unitId, params },
      }) => {
        // const isAdmin = await user.isSubGroupAdminOrBetter(params);
        // const markerType = await user.getMarkerType(studentId);
        // const { allowedMarkerTypes } =
        //   await instance.getUnitOfAssessment(unitId);

        // if (!allowedMarkerTypes.includes(markerType) && !isAdmin) {
        //   throw new TRPCError({
        //     code: "UNAUTHORIZED",
        //     message: "User is not correct marker type",
        //   });
        // }

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

        const { unit: unitDto, marks } = await unit.getMarks(studentId);

        const supervisorSubmission = marks[supervisorId];
        const readerSubmission =
          readerId === undefined ? undefined : marks[readerId];

        const result = Grade.handleSubmission(
          allowedMarkerTypes,
          supervisorSubmission,
          readerSubmission,
        );

        if (result.status === MarkSubmissionEvent.SINGLE_MARKED) {
          const grade = await unit.updateFinalMark(studentId, {
            status: ConsensusStage.RESOLVED,
            method: ConsensusMethod.AUTO,
            comment: "",
            grade: result.grade,
          });

          if (markerType === MarkerType.SUPERVISOR) {
            await mailer.notifyMarkingComplete({
              params: instance.params,
              student: await student.get(),
              project: (await student.getAllocation()).project,
              unit: unitDto,
              unitGrade: grade,
              supervisor: { user: await user.toDTO(), submission: data },
            });
          }

          if (markerType === MarkerType.READER) {
            await mailer.notifyMarkingComplete({
              params: instance.params,
              student: await student.get(),
              project: (await student.getAllocation()).project,
              unit: unitDto,
              unitGrade: grade,
              reader: { user: await user.toDTO(), submission: data },
            });
          }

          return;
        }

        if (result.status === MarkSubmissionEvent.FIRST_OF_TWO) {
          await unit.updateFinalMark(studentId, {
            status: ConsensusStage.UNRESOLVED,
          });

          await mailer.sendMarkingReceipt({
            params: instance.params,
            student: await student.get(),
            project: (await student.getAllocation()).project,
            marker: await user.toDTO(),
            unit: unitDto,
            submission: data,
          });

          return;
        }

        if (result.status === MarkSubmissionEvent.AUTO_RESOLVED) {
          const grade = await unit.updateFinalMark(studentId, {
            status: ConsensusStage.RESOLVED,
            method: ConsensusMethod.AUTO,
            comment: "",
            grade: result.grade,
          });

          await mailer.notifyMarkingComplete({
            params: instance.params,
            student: await student.get(),
            project: (await student.getAllocation()).project,
            unit: unitDto,
            unitGrade: grade,
            supervisor:
              supervisorSubmission && !supervisorSubmission.draft
                ? {
                    user: await student.getSupervisor(),
                    submission: supervisorSubmission,
                  }
                : undefined,
            reader:
              readerSubmission && !readerSubmission.draft
                ? {
                    user: await student.getReader(),
                    submission: readerSubmission,
                  }
                : undefined,
          });

          return;
        }

        if (result.status === MarkSubmissionEvent.MODERATE) {
          const grade = await unit.updateFinalMark(studentId, {
            status: ConsensusStage.MODERATE,
          });

          if (
            supervisorSubmission.draft ||
            !readerSubmission ||
            readerSubmission?.draft
          ) {
            throw new Error(
              "Cannot enter moderation if one submission is draft",
            );
          }

          await mailer.notifyModeration({
            params: instance.params,
            student: await student.get(),
            project: (await student.getAllocation()).project,
            unit: unitDto,
            unitGrade: grade,
            supervisor: {
              user: await student.getSupervisor(),
              submission: supervisorSubmission,
            },
            reader: {
              user: await student.getReader(),
              submission: readerSubmission,
            },
          });

          return;
        }

        if (
          result.status === MarkSubmissionEvent.NEGOTIATE1 ||
          result.status === MarkSubmissionEvent.NEGOTIATE2
        ) {
          const grade = await unit.updateFinalMark(studentId, {
            status: ConsensusStage.NEGOTIATE,
          });

          if (
            supervisorSubmission.draft ||
            !readerSubmission ||
            readerSubmission?.draft
          ) {
            throw new Error(
              "Cannot enter negotiation if one submission is draft",
            );
          }

          await mailer.notifyNegotiation({
            params: instance.params,
            student: await student.get(),
            project: (await student.getAllocation()).project,
            unit: unitDto,
            unitGrade: grade,
            supervisor: {
              user: await student.getSupervisor(),
              submission: supervisorSubmission,
            },
            reader: {
              user: await student.getReader(),
              submission: readerSubmission,
            },
          });

          return;
        }

        // assert_unreachable();
      },
    ),

  resolveNegotiation: procedure.unitOfAssessment.marker
    .input(z.object({ data: markOverrideDtoSchema }))
    .mutation(
      async ({
        ctx: { unit, instance, mailer },
        input: { studentId, data },
      }) => {
        const result = Grade.handleNegotiationResolution(data.grade);

        if (result.status === MarkSubmissionEvent.AUTO_RESOLVED) {
          await unit.updateFinalMark(studentId, {
            status: ConsensusStage.RESOLVED,
            method: ConsensusMethod.NEGOTIATED,
            grade: result.grade,
            comment: data.justification,
          });

          const student = await instance.getStudent(studentId);

          const {
            unit: unitDto,
            grade,
            marks,
          } = await unit.getMarks(studentId);

          if (!grade) {
            throw new Error(
              "Grade does not exist after negotiation submission.",
            );
          }

          const supervisor = await student.getSupervisor();
          const supervisorSubmission = marks[supervisor.id];

          const reader = await student.getReader();
          const readerSubmission = marks[reader.id];

          if (
            !(
              readerSubmission &&
              !readerSubmission.draft &&
              supervisorSubmission &&
              !supervisorSubmission.draft
            )
          ) {
            throw new Error(
              "Cannot complete negotiation if all submissions not present",
            );
          }

          await mailer.notifyMarkingComplete({
            params: instance.params,
            student: await student.get(),
            project: (await student.getAllocation()).project,
            unit: unitDto,
            unitGrade: grade,
            supervisor: { user: supervisor, submission: supervisorSubmission },
            reader: { user: reader, submission: readerSubmission },
          });

          return;
        }

        if (result.status === MarkSubmissionEvent.MODERATE) {
          await unit.updateFinalMark(studentId, {
            status: ConsensusStage.MODERATE_AFTER_NEGOTIATION,
            grade: data.grade,
            comment: data.justification,
          });

          const student = await instance.getStudent(studentId);

          const {
            unit: unitDto,
            grade,
            marks,
          } = await unit.getMarks(studentId);

          if (!grade) {
            throw new Error(
              "Grade does not exist after negotiation submission.",
            );
          }

          const supervisor = await student.getSupervisor();
          const supervisorSubmission = marks[supervisor.id];

          const reader = await student.getReader();
          const readerSubmission = marks[reader.id];

          if (
            !(
              readerSubmission &&
              !readerSubmission.draft &&
              supervisorSubmission &&
              !supervisorSubmission.draft
            )
          ) {
            throw new Error(
              "Cannot enter moderation if all submissions not present",
            );
          }

          await mailer.notifyModeration({
            params: instance.params,
            student: await student.get(),
            project: (await student.getAllocation()).project,
            unit: unitDto,
            unitGrade: grade,
            supervisor: {
              user: await student.getSupervisor(),
              submission: supervisorSubmission,
            },
            reader: {
              user: await student.getReader(),
              submission: readerSubmission,
            },
          });

          return;
        }
      },
    ),
});
