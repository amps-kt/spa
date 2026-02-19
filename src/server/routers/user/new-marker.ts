import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  projectDtoSchema,
  readerDtoSchema,
  studentDtoSchema,
  supervisorDtoSchema,
  unitOfAssessmentDtoSchema,
} from "@/dto";
import {
  studentGradingLifecycleStateSchema,
  unitGradingLifecycleStateSchema,
  markingSubmissionDtoSchema,
  unitGradeDtoSchema,
  UnitGradingLifecycleState,
} from "@/dto/marking";

import { markerTypeSchema } from "@/db/types";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

export const newMarkerRouter = createTRPCRouter({
  getAssignedMarking: procedure.instance.marker
    .output(
      z
        .object({
          project: projectDtoSchema,
          student: studentDtoSchema,
          role: markerTypeSchema,
          status: studentGradingLifecycleStateSchema,
          units: z
            .object({
              unit: unitOfAssessmentDtoSchema,
              status: unitGradingLifecycleStateSchema,
            })
            .array(),
        })
        .array(),
    )
    .query(async ({ ctx: { user } }) => await user.getAssignedMarking()),

  // Help name
  getStudentMarkingData: procedure.instance.user
    .input(z.object({ studentId: z.string() }))
    .output(
      z.object({
        student: studentDtoSchema,
        units: z.array(
          z.object({
            unit: unitOfAssessmentDtoSchema,
            grade: unitGradeDtoSchema.optional(),
            status: UnitGradingLifecycleState,
          }),
        ),
      }),
    )
    .query(async ({ ctx: { instance, user }, input: { studentId } }) => {
      const isMarker = await user.isStudentMarker(instance.params, studentId);
      const isAdmin = await user.isSubGroupAdminOrBetter(instance.params);

      if (!(isMarker || isAdmin)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const student = await instance.getStudent(studentId);

      const studentData = await student.get();
      const markerType = isAdmin
        ? undefined
        : await user
            .toMarker(instance.params)
            .then((x) => x.getMarkerType(studentId));

      const units = await student.getMarkingData(markerType);

      return { student: studentData, units };
    }),

  getStudentMarkers: procedure.instance.user
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

  getStudentMarkerMarksByUnitId: procedure.instance.user
    .input(
      z.object({
        studentId: z.string(),
        markerId: z.string(),
        unitId: z.string(),
      }),
    )
    .output(z.object({ marks: markingSubmissionDtoSchema.optional() }))
    .query(
      async ({ ctx: { instance }, input: { studentId, markerId, unitId } }) => {
        const student = await instance.getStudent(studentId);
        const marks = await student.getMarkerMarksByUnitId({
          markerId,
          unitId,
        });

        return { marks };
      },
    ),

  getConsensusGrade: procedure.instance.user
    .input(z.object({ studentId: z.string(), unitId: z.string() }))
    .output(z.object({ unitGrade: unitGradeDtoSchema }))
    .query(async ({ ctx: { instance }, input: { studentId, unitId } }) => {
      // TODO check if perm

      const student = await instance.getStudent(studentId);
      const unitGrade = await student.unitConsensus({ unitId });

      return { unitGrade };
    }),
});
