import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { userDtoSchema } from "@/dto";

import { Role } from "@/db/types";
import { PreferenceType, Stage } from "@/db/types";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

import { projectPreferenceCardDtoSchema } from "@/lib/validations/board";
import {
  convertPreferenceType,
  studentPreferenceSchema,
} from "@/lib/validations/student-preference";

export const preferenceRouter = createTRPCRouter({
  /**
   * Get all draft preferences of a student
   */
  getAll: procedure.instance.user
    .input(z.object({ studentId: z.string() }))
    .output(
      z.array(
        z.object({
          project: z.object({ id: z.string(), title: z.string() }),
          supervisor: userDtoSchema,
          type: z.enum(PreferenceType),
          rank: z.number().or(z.nan()),
        }),
      ),
    )
    .query(async ({ ctx: { instance }, input: { studentId } }) => {
      const student = await instance.getStudent(studentId);
      const draftPreferences = await student.getAllDraftPreferences();

      return draftPreferences.map(({ project, type, supervisor }, i) => ({
        project: { id: project.id, title: project.title },
        supervisor,
        type: type,
        rank: type === PreferenceType.PREFERENCE ? i + 1 : NaN,
      }));
    }),

  /**
   * Get all saved preferences of a student
   */
  // TODO: change output type
  getAllSaved: procedure.instance.user
    .input(z.object({ studentId: z.string() }))
    .output(
      z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          supervisor: userDtoSchema,
          rank: z.number(),
        }),
      ),
    )
    .query(async ({ ctx: { instance }, input: { studentId } }) => {
      const student = await instance.getStudent(studentId);
      const submittedPreferences = await student.getSubmittedPreferences();

      return submittedPreferences.map(({ project, rank, supervisor }) => ({
        id: project.id,
        title: project.title,
        supervisor,
        rank,
      }));
    }),

  getByProject: procedure.instance.student
    .output(z.record(z.string(), z.enum(PreferenceType)))
    .query(async ({ ctx: { user } }) => {
      const draftPreferences = await user.getAllDraftPreferences();

      return draftPreferences.reduce(
        (acc, { project, type }) => ({ ...acc, [project.id]: type }),
        {} as Record<string, PreferenceType>,
      );
    }),

  /**
   * Student updating their own preference over a particular project
   */
  update: procedure.instance
    .inStage([Stage.STUDENT_BIDDING])
    .student.input(
      z.object({
        projectId: z.string(),
        preferenceType: studentPreferenceSchema,
      }),
    )
    .output(z.void())
    .mutation(
      async ({
        ctx: { user, instance, audit },
        input: { projectId, preferenceType },
      }) => {
        audit("Updating preference for project:", {
          studentId: user.id,
          projectId,
        });

        if (await user.hasSelfDefinedProject()) {
          audit(
            "Student has self-defined a project, skipping preference update",
          );
          // todo: should return some kind of error
          return;
        }
        audit("not self-defined, checking flags");

        const { flag: studentFlag } = await user.get();
        const projectFlags = await instance.getProject(projectId).getFlags();

        if (!projectFlags.map((f) => f.id).includes(studentFlag.id)) {
          audit("Project is not suitable for student", {
            projectFlags,
            studentFlag,
          });
          // todo: should return some kind of error
          return;
        }

        const newPreferenceType = convertPreferenceType(preferenceType);

        await user.updateDraftPreferenceType(projectId, newPreferenceType);
        audit("Preference updated successfully");
      },
    ),

  /**
   * Student updating their own preference over multiple projects
   */
  updateMany: procedure.instance
    .inStage([Stage.STUDENT_BIDDING])
    .student.input(
      z.object({
        projectIds: z.array(z.string()),
        preferenceType: studentPreferenceSchema,
      }),
    )
    .output(z.void())
    .mutation(
      async ({
        ctx: { user, instance, audit },
        input: { projectIds, preferenceType },
      }) => {
        if (await user.hasSelfDefinedProject()) {
          audit(
            "Student has self-defined a project, skipping preference update",
          );
          // todo: should return some kind of error
          return;
        }
        audit("not self-defined, checking flags");

        const { flag: studentFlag } = await user.get();

        const allProjectsCompatible = await Promise.all(
          projectIds.map((projectId) =>
            instance.getProject(projectId).getFlags(),
          ),
        ).then((projects) =>
          projects.every((p) => p.map((f) => f.id).includes(studentFlag.id)),
        );

        if (!allProjectsCompatible) {
          audit("One or more projects are not suitable for student", {
            studentFlag,
          });
          // todo: should return some kind of error
          return;
        }

        const newPreferenceType = convertPreferenceType(preferenceType);

        await user.updateManyDraftPreferenceTypes(
          projectIds,
          newPreferenceType,
        );
        audit("Preferences updated successfully");
      },
    ),

  /**
   * Student reordering their own preference over a project
   */
  reorder: procedure.instance
    .inStage([Stage.STUDENT_BIDDING])
    .student.input(
      z.object({
        projectId: z.string(),
        preferenceType: z.enum(PreferenceType),
        updatedRank: z.number(),
      }),
    )
    .output(z.void())
    .mutation(
      async ({
        ctx: { instance, user, audit },
        input: { projectId, preferenceType, updatedRank },
      }) => {
        audit("Attempting to reorder preference for project:", {
          studentId: user.id,
          projectId,
          preferenceType,
          updatedRank,
        });

        if (await user.hasSelfDefinedProject()) {
          audit("Student has self-defined a project, skipping reorder", {
            studentId: user.id,
          });
          return;
        }

        audit("not self-defined, checking flags");
        const { flag: studentFlag } = await user.get();
        const projectFlags = await instance.getProject(projectId).getFlags();

        if (!projectFlags.map((f) => f.id).includes(studentFlag.id)) {
          audit("Project is not suitable for student", {
            projectFlags,
            studentFlag,
          });
          return;
        }

        audit("Updating draft preference rank", {
          studentId: user.id,
          projectId,
          updatedRank,
          preferenceType,
        });

        await user.updateDraftPreferenceRank(
          projectId,
          updatedRank,
          preferenceType,
        );
        audit("Draft preference rank updated successfully", {
          studentId: user.id,
          projectId,
          updatedRank,
        });
      },
    ),

  // todo: standardise MaybePreferenceType
  getForProject: procedure.instance.student
    .input(z.object({ projectId: z.string() }))
    .output(z.enum(PreferenceType).or(z.literal("None")))
    .query(
      async ({ ctx: { user }, input: { projectId } }) =>
        (await user.getDraftPreference(projectId)) ?? "None",
    ),

  // todo: standardise error reporting
  submit: procedure.instance
    .withRoles([Role.ADMIN, Role.STUDENT])
    .input(z.object({ studentId: z.string() }))
    .output(z.date().optional())
    .mutation(
      async ({ ctx: { instance, user, audit }, input: { studentId } }) => {
        const student = !(await user.isSubGroupAdminOrBetter(instance.params))
          ? await user.toStudent(instance.params)
          : await instance.getStudent(studentId);

        if (studentId !== student.id) {
          audit("Attempted student preference submission (unauthorized)", {
            studentId,
          });
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        if (await student.hasSelfDefinedProject()) {
          audit("Attempted student preference submission (self-defined)", {
            studentId,
          });
          return;
        }

        audit("Student preferences submitted", { studentId });
        return await student.submitPreferences();
      },
    ),

  initialBoardState: procedure.instance
    .inStage([Stage.STUDENT_BIDDING, Stage.ALLOCATION_ADJUSTMENT])
    .withRoles([Role.ADMIN, Role.STUDENT])
    .input(z.object({ studentId: z.string() }))
    .output(
      z.object({
        initialProjects: z.object({
          [PreferenceType.PREFERENCE]: z.array(projectPreferenceCardDtoSchema),
          [PreferenceType.SHORTLIST]: z.array(projectPreferenceCardDtoSchema),
        }),
      }),
    )
    .query(async ({ ctx: { instance, audit }, input: { studentId } }) => {
      const student = await instance.getStudent(studentId);

      audit("Fetching initial board state for student", { studentId });

      return { initialProjects: await student.getPreferenceBoardState() };
    }),
});
