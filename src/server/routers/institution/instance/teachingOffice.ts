import { z } from "zod";

import { studentDtoSchema, unitOfAssessmentDtoSchema } from "@/dto";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

import { keyBy } from "@/lib/utils/key-by";

export const teachingOfficeRouter = createTRPCRouter({
  getStudentSubmissionInfo: procedure.instance.subGroupAdmin
    .output(
      z.array(
        z.object({
          student: studentDtoSchema.extend({ enrolled: z.boolean() }),
          unitsOfAssessment: z.array(
            z.object({
              unit: unitOfAssessmentDtoSchema,
              submitted: z.boolean(),
              customDueDate: z.date().optional(),
              customWeight: z.number().optional(),
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
        unitsOfAssessment: flagsById[student.flag.id].unitsOfAssessment.map(
          (unit) => ({
            unit,
            submitted: true,
            customDueDate: unit.studentSubmissionDeadline,
            customWeight: unit.weight,
          }),
        ),
      }));
    }),
});
