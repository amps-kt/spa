import { z } from "zod";

import {
  studentDtoSchema,
  unitOfAssessmentDtoSchema,
  unitGradeDtoSchema__NEW,
  type UnitGradeDTO__NEW,
} from "@/dto";
import {
  studentDeltaSchema,
  studentSubmissionsRowDtoSchema,
} from "@/dto/marking/student-submissions";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

import { keyBy } from "@/lib/utils/key-by";

export const teachingOfficeRouter = createTRPCRouter({
  getStudentSubmissionInfo: procedure.instance.subGroupAdmin
    .output(
      z.array(
        z.object({
          student: studentDtoSchema.extend({ enrolled: z.boolean() }),
          units: z.array(
            z.object({
              unit: unitOfAssessmentDtoSchema,
              grade: unitGradeDtoSchema__NEW,
            }),
          ),
        }),
      ),
    )
    .query(async ({ ctx: { instance } }) => {
      const students = await instance.getStudents();
      const flags = await instance.getFlagsWithAssessmentDetails();

      const flagsById = keyBy(flags, (flag) => flag.id);

      return students.map((student) => ({
        student,
        units: flagsById[student.flag.id].unitsOfAssessment.map((unit) => ({
          unit,
          grade: {
            submitted: true,
            customDueDate: unit.studentSubmissionDeadline,
            customWeight: unit.weight,
          } as unknown as UnitGradeDTO__NEW,
        })),
      }));
    }),

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
      async ({ ctx: { instance }, input: { studentDeltas } }) =>
        await instance.updateStudentSubmissionInfo(studentDeltas),
    ),
});
