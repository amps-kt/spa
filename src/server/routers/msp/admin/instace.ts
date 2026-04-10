import z from "zod";

import {
  type ProjectDTO,
  projectDtoSchema,
  type ReaderDTO,
  readerDtoSchema,
  type StudentDTO,
  studentDtoSchema,
  type StudentGradingLifecycleState,
  studentGradingLifecycleStateSchema,
  type SupervisorDTO,
  supervisorDtoSchema,
  type UnitGradingLifecycleState,
  unitGradingLifecycleStateSchema,
  type UnitOfAssessmentDTO,
  unitOfAssessmentDtoSchema,
  type UserDTO,
  userDtoSchema,
} from "@/dto";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

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

      type MarkerStatusStruct = {
        marker: UserDTO;
        numProjectsToMark: number;
        numNotDone: number;
        numBlocked: number;
        numActionable: number;
      };

      const userMap: Record<string, MarkerStatusStruct> = {};

      function get(marker: UserDTO): MarkerStatusStruct {
        const data = userMap[marker.id];

        if (data !== undefined) return data;

        return {
          marker,
          numProjectsToMark: 0,
          numNotDone: 0,
          numBlocked: 0,
          numActionable: 0,
        };
      }

      function set(data: MarkerStatusStruct) {
        userMap[data.marker.id] = data;
      }

      function update(
        student: {
          project: ProjectDTO;
          student: StudentDTO;
          status: StudentGradingLifecycleState;
          units: {
            unit: UnitOfAssessmentDTO;
            status: UnitGradingLifecycleState;
          }[];
          reader?: ReaderDTO;
          supervisor: SupervisorDTO;
        },
        markerUser: UserDTO,
      ) {
        const marker = get(markerUser);

        marker.numProjectsToMark += 1;

        if (student.status !== "DONE") {
          marker.numNotDone += 1;
        }

        if (student.status === "ACTION_REQUIRED") {
          marker.numActionable += 1;
        }
        if (student.status === "NOT_SUBMITTED" || student.status === "CLOSED") {
          marker.numBlocked += 1;
        }

        if (
          student.status === "PENDING" &&
          student.units.some(
            (u) =>
              u.status === "IN_NEGOTIATION" ||
              u.status === "PENDING_2ND_MARKER",
            // should check if this is the user that needs to submit
            // but this will do for now...
          )
        ) {
          marker.numActionable += 1;
        }

        set(marker);
      }

      data.forEach((student) => {
        update(student, student.supervisor);

        if (student.reader !== undefined) {
          update(student, student.reader);
        }
      });

      return Object.values(userMap).toSorted((a, b) =>
        a.marker.name.localeCompare(b.marker.name),
      );
    }),
});
