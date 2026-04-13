import z from "zod";

import {
  projectDtoSchema,
  readerDtoSchema,
  studentDtoSchema,
  StudentGradingLifecycleState,
  studentGradingLifecycleStateSchema,
  supervisorDtoSchema,
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
    .output(
      z.array(
        z.object({
          project: projectDtoSchema,
          student: studentDtoSchema,
          status: studentGradingLifecycleStateSchema,
          units: z.array(
            z.object({
              unit: unitOfAssessmentDtoSchema,
              status: unitGradingLifecycleStateSchema,
            }),
          ),
          reader: readerDtoSchema.optional(),
          supervisor: supervisorDtoSchema,
        }),
      ),
    )
    .query(
      async ({ ctx: { instance } }) => await instance.getStudentMarkingStatus(),
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
        if (!student.reader) return supervisor;

        return [supervisor, { marker: T.toUserDTO(student.reader), student }];
      });

      const grouped = groupBy(studentMarkerPairs, (p) => p.marker.id);

      return Object.values(grouped)
        .map((entries) => {
          // since this has been grouped, we can just take the first element to get the user
          // if you don't like this we can make a markerId |-> MarkerDTO map above and index that
          const marker = entries[0].marker;
          return {
            marker,
            numProjectsToMark: entries.length,
            numNotDone: count(
              entries,
              (e) => e.student.status !== StudentGradingLifecycleState.DONE,
            ),
            numBlocked: count(
              entries,
              (e) =>
                e.student.status ===
                  StudentGradingLifecycleState.NOT_SUBMITTED ||
                e.student.status === StudentGradingLifecycleState.CLOSED,
            ),
            numActionable: count(
              entries,
              (e) =>
                e.student.status ===
                  StudentGradingLifecycleState.ACTION_REQUIRED ||
                (e.student.status === StudentGradingLifecycleState.PENDING &&
                  e.student.units.some(
                    (u) =>
                      u.status === UnitGradingLifecycleState.IN_NEGOTIATION ||
                      (u.status ===
                        UnitGradingLifecycleState.PENDING_2ND_MARKER &&
                        !u.submissions.find((x) => x.markerId === marker.id)),
                  )),
            ),
          };
        })
        .toSorted((a, b) => a.marker.name.localeCompare(b.marker.name));
    }),

  getLateMarkers: procedure.instance.subGroupAdmin
    .output(z.array(userDtoSchema))
    .query(async ({ ctx: { instance } }) => await instance.getLateMarkers()),

  notifyLateMarkers: procedure.instance.subGroupAdmin
    .output(z.void())

    .mutation(async ({ ctx: { mailer, instance, logger, user } }) => {
      const markers = await instance.getLateMarkers();

      logger.log(LogLevels.AUDIT, "Sending marking reminders", {
        numAcademics: markers.length,
        authorizerId: user.id,
      });
      await mailer.notifyGenericMarkingOverdue({
        params: instance.params,
        markers,
      });
    }),
});
