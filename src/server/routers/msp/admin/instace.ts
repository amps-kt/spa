import z from "zod";

import {
  markingSubmissionDtoSchema,
  projectDtoSchema,
  readerDtoSchema,
  studentDtoSchema,
  StudentGradingLifecycleState,
  studentGradingLifecycleStateSchema,
  supervisorDtoSchema,
  unitGradeDtoSchema,
  UnitGradingLifecycleState,
  unitGradingLifecycleStateSchema,
  unitOfAssessmentDtoSchema,
  userDtoSchema,
} from "@/dto";

import { Transformers as T } from "@/db/transformers";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

import { LogLevels } from "@/lib/logging/logger";
import { count } from "@/lib/utils/count";
import { groupBy } from "@/lib/utils/group-by";

export const mspAdminInstanceRouter = createTRPCRouter({
  getStudentMarkingStatus: procedure.instance.subGroupAdmin
    .input(z.object({ flagId: z.string().optional() }))
    .output(
      z.array(
        z.object({
          project: projectDtoSchema,
          student: studentDtoSchema,
          status: studentGradingLifecycleStateSchema,
          units: z.array(
            z.object({
              unit: unitOfAssessmentDtoSchema,
              grade: unitGradeDtoSchema.optional(),
              submissions: z.array(markingSubmissionDtoSchema),
              status: unitGradingLifecycleStateSchema,
            }),
          ),
          reader: readerDtoSchema.optional(),
          supervisor: supervisorDtoSchema,
          finalGrade: z.number().optional(),
        }),
      ),
    )
    .query(
      async ({ ctx: { instance }, input: { flagId } }) =>
        await instance.getStudentMarkingStatus(flagId),
    ),

  getMarkerMarkingStatus: procedure.instance.subGroupAdmin
    .output(
      z.array(
        z.object({
          marker: userDtoSchema,
          numProjectsToMark: z.number(),
          numNotDone: z.number(),
          numBlocked: z.number(),
          numActionable: z.number(),
        }),
      ),
    )
    .query(async ({ ctx: { instance } }) => {
      const data = await instance.getStudentMarkingStatus();

      const studentMarkerPairs = data.flatMap((student) => {
        const supervisor = { marker: T.toUserDTO(student.supervisor), student };
        if (!student.reader) return [supervisor];

        return [supervisor, { marker: T.toUserDTO(student.reader), student }];
      });

      const grouped = groupBy(studentMarkerPairs, (p) => p.marker.id);

      return Object.values(grouped)
        .map((entries) => {
          const marker = entries[0].marker;

          const numProjectsToMark = entries.length;

          const numNotDone = count(
            entries,
            ({ student: { status } }) =>
              status !== StudentGradingLifecycleState.DONE,
          );

          const numBlocked = count(
            entries,
            ({ student: { status } }) =>
              status === StudentGradingLifecycleState.NOT_SUBMITTED ||
              status === StudentGradingLifecycleState.CLOSED,
          );

          const numActionable = count(
            entries,
            ({ student: { status, units } }) =>
              status === StudentGradingLifecycleState.ACTION_REQUIRED ||
              (status === StudentGradingLifecycleState.PENDING &&
                units.some(
                  ({ status, submissions }) =>
                    status === UnitGradingLifecycleState.IN_NEGOTIATION ||
                    (status === UnitGradingLifecycleState.PENDING_2ND_MARKER &&
                      !submissions.find((x) => x.markerId === marker.id)),
                )),
          );

          return {
            marker,
            numProjectsToMark,
            numNotDone,
            numBlocked,
            numActionable,
          };
        })
        .toSorted((a, b) => a.marker.name.localeCompare(b.marker.name));
    }),

  getLateMarkers: procedure.instance.subGroupAdmin
    .output(z.array(userDtoSchema))
    .query(async ({ ctx: { instance } }) =>
      (await instance.getLateMarkers()).map((x) => x.marker),
    ),

  notifyLateMarkers: procedure.instance.subGroupAdmin
    .output(z.void())

    .mutation(async ({ ctx: { mailer, instance, logger, user } }) => {
      const markers = await instance.getLateMarkers();

      logger.log(LogLevels.AUDIT, "Sending marking reminders", {
        numAcademics: markers.length,
        authorizerId: user.id,
      });

      console.log(markers);
      console.log(markers.length);

      // await mailer.notifyGenericMarkingOverdue({
      //   params: instance.params,
      //   markers,
      // });
    }),
});
