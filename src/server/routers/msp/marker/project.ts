import { TRPCError } from "@trpc/server";
import z from "zod";

import { readerDtoSchema, supervisorDtoSchema } from "@/dto";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

export const markerProjectRouter = createTRPCRouter({
  // [#22d3ee] - revisit middleware
  getMarkers: procedure.instance.user
    .input(z.object({ studentId: z.string() }))
    .output(
      z.object({ reader: readerDtoSchema, supervisor: supervisorDtoSchema }),
    )
    .query(async ({ ctx: { instance, user }, input: { studentId } }) => {
      const isMarker = await user.isStudentMarker(instance.params, studentId);
      const isAdmin = await user.isSubGroupAdminOrBetter(instance.params);

      if (!(isMarker || isAdmin)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const student = await instance.getStudent(studentId);
      const reader = await student.getReader();
      const supervisor = await student.getSupervisor();

      return { reader, supervisor };
    }),
});
