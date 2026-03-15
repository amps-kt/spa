import z from "zod";

import { markOverrideDtoSchema } from "@/dto";

import { ConsensusMethod, ConsensusStage } from "@/db/types";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

export const unitOfAssessmentRouter = createTRPCRouter({
  resolveModeration: procedure.unitOfAssessment.subGroupAdmin
    .input(z.object({ data: markOverrideDtoSchema }))
    .mutation(
      async ({
        ctx: { unit, mailer, instance },
        input: { studentId, data },
      }) => {
        await unit.updateFinalMark(studentId, {
          status: ConsensusStage.RESOLVED,
          method: ConsensusMethod.MODERATED,
          comment: data.justification,
          grade: data.grade,
        });

        const student = await instance.getStudent(studentId);

        const { unit: unitDto, marks, grade } = await unit.getMarks(studentId);

        if (!grade) {
          throw Error("Moderation resolved but grade did not exist");
        }

        const supervisor = await student.getSupervisor();
        const supervisorSubmission = marks[supervisor.id];

        const reader = await student.getReader();
        const readerSubmission = marks[reader.id];

        await mailer.notifyMarkingComplete({
          params: instance.params,
          student: await student.get(),
          project: (await student.getAllocation()).project,
          unit: unitDto,
          unitGrade: grade,
          supervisor:
            supervisorSubmission && !supervisorSubmission.draft
              ? { user: supervisor, submission: supervisorSubmission }
              : undefined,
          reader:
            readerSubmission && !readerSubmission.draft
              ? { user: reader, submission: readerSubmission }
              : undefined,
        });

        return;
      },
    ),

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
    .mutation(
      async ({
        ctx: { institution, unit, mailer, instance },
        input: { markerId, studentId },
      }) => {
        await unit.resetMarks({ markerId, studentId });

        const marker = await institution.getUserObjectById(markerId).toDTO();

        const student = await instance.getStudent(studentId);

        await mailer.notifyMarkingReset({
          params: instance.params,
          unit: await unit.toDTO(),
          marker,
          student: await student.get(),
          project: (await student.getAllocation()).project,
        });
      },
    ),
});
