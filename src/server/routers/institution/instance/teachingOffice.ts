import { z } from "zod";

import {
  studentDeltaSchema,
  studentSubmissionsRowDtoSchema,
} from "@/dto/marking/student-submissions";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

export const teachingOfficeRouter = createTRPCRouter({
  getFlagStudentSubmissionInfo: procedure.instance.subGroupAdmin
    .input(z.object({ flagId: z.string() }))
    .output(
      z.object({
        flagId: z.string(),
        data: z.array(studentSubmissionsRowDtoSchema),
      }),
    )
    .query(async ({ ctx: { instance }, input: { flagId } }) => ({
      flagId,
      data: await instance.getStudentUnitSubmissionsByFlag(flagId),
    })),

  updateStudentSubmissionInfo: procedure.instance.subGroupAdmin
    .input(z.object({ studentDeltas: z.array(studentDeltaSchema) }))
    .output(z.void())
    .mutation(
      async ({ ctx: { instance, mailer }, input: { studentDeltas } }) => {
        const res = await instance.updateStudentSubmissionInfo(studentDeltas);
        // Here we need to put in the email stuff...

        const params = instance.params;

        await Promise.all(
          studentDeltas.map(async (d) => {
            if (d.enrolled === false) {
              const student = await instance.getStudent(d.studentId);
              const { project, supervisor } = await student.getAllocation();
              const reader = await student.getReader();

              await mailer.notifyStudentWithdrawn({
                params,
                student: await student.get(),
                supervisor,
                project,
                reader,
              });
            }

            await Promise.all([
              d.units.map(async (u) => {
                if (u.customWeight === 0) {
                  const student = await instance.getStudent(d.studentId);
                  const { project, supervisor } = await student.getAllocation();
                  const reader = await student.getReader();
                  const unit = await instance.getUnitOfAssessment(u.unitId);

                  await mailer.notifyMedicalVoidGranted({
                    params,
                    project,
                    reader,
                    student: await student.get(),
                    supervisor,
                    unit,
                  });
                }
                if (u.customDueDate !== undefined) {
                  const student = await instance.getStudent(d.studentId);
                  const { project, supervisor } = await student.getAllocation();
                  const reader = await student.getReader();
                  const unit = await instance.getUnitOfAssessment(u.unitId);

                  const unitGrade = await student.getUnitGrade({
                    unitId: u.unitId,
                  });

                  await mailer.notifyExtensionGranted({
                    params,
                    student: await student.get(),
                    project,
                    unit,
                    unitGrade,
                    reader,
                    supervisor,
                  });
                }
              }),
            ]);
          }),
        );

        return res;
      },
    ),
});
