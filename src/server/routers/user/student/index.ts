import { z } from "zod";

import { ProjectAllocationStatus, studentDtoSchema } from "@/dto";
import { projectDtoSchema, supervisorDtoSchema } from "@/dto";

import { Supervisor } from "@/data-objects";

import { allocationMethodSchema } from "@/db/types";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

import { preferenceRouter } from "./preference";

const byId = createTRPCRouter({
  get: procedure.instance.subGroupAdmin
    .input(z.object({ studentId: z.string() }))
    .output(studentDtoSchema)
    .query(async ({ ctx: { instance }, input: { studentId } }) => {
      const student = await instance.getStudent(studentId);
      return await student.get();
    }),

  getMaybeAllocation: procedure.instance.subGroupAdmin
    .input(z.object({ studentId: z.string() }))
    .output(
      z.discriminatedUnion("allocationMethod", [
        z.object({
          allocationMethod: z.literal(ProjectAllocationStatus.UNALLOCATED),
        }),
        z.object({
          allocationMethod: allocationMethodSchema,
          project: projectDtoSchema,
          supervisor: supervisorDtoSchema,
          rank: z.number(),
        }),
      ]),
    )
    .query(async ({ ctx: { instance }, input: { studentId } }) => {
      const student = await instance.getStudent(studentId);
      if (await student.hasAllocation()) return await student.getAllocation();
      return { allocationMethod: ProjectAllocationStatus.UNALLOCATED };
    }),

  latestSubmission: procedure.instance.subGroupAdmin
    .input(z.object({ studentId: z.string() }))
    .output(z.date().optional())
    .query(async ({ ctx: { instance }, input: { studentId } }) => {
      const student = await instance.getStudent(studentId);
      return await student.getLatestSubmissionDateTime();
    }),

  getSuitableProjects: procedure.instance.subGroupAdmin
    .input(z.object({ studentId: z.string() }))
    .output(z.array(projectDtoSchema))
    .query(async ({ ctx: { instance }, input: { studentId } }) => {
      const student = await instance.getStudent(studentId);
      const { flag: studentFlag } = await student.get();

      const preferences = await student.getAllDraftPreferences();
      const preferenceIds = new Set(preferences.map(({ project: p }) => p.id));

      const projectData = await instance.getProjectDetails();

      return projectData
        .filter((p) => {
          if (preferenceIds.has(p.project.id)) return false;
          if (p.project.preAllocatedStudentId) return false;
          return p.project.flags.map((f) => f.id).includes(studentFlag.id);
        })
        .map(({ project }) => project);
    }),
});

export const studentRouter = createTRPCRouter({
  byId,
  preference: preferenceRouter,

  exists: procedure.instance.user
    .input(z.object({ studentId: z.string() }))
    .output(z.boolean())
    .query(
      async ({ ctx: { instance }, input: { studentId } }) =>
        await instance.isStudent(studentId),
    ),

  getAllocation: procedure.instance.student
    .output(
      z.object({
        allocationMethod: allocationMethodSchema,
        project: projectDtoSchema,
        supervisor: supervisorDtoSchema,
        rank: z.number(),
      }),
    )
    .query(async ({ ctx: { user } }) => await user.getAllocation()),

  // MOVE to instance router
  allocationAccess: procedure.instance.student
    .output(z.boolean())
    .query(async ({ ctx: { instance } }) => {
      const { studentAllocationAccess } = await instance.get();
      return studentAllocationAccess;
    }),

  // MOVE to instance router
  setAllocationAccess: procedure.instance.subGroupAdmin
    .input(z.object({ access: z.boolean() }))
    .output(z.boolean())
    .mutation(async ({ ctx: { instance, audit }, input: { access } }) => {
      audit("Set student allocation access", { setTo: access });
      return await instance.setStudentPublicationAccess(access);
    }),

  latestSubmission: procedure.instance.student
    .output(z.date().optional())
    .query(
      async ({ ctx: { user } }) => await user.getLatestSubmissionDateTime(),
    ),

  isPreAllocated: procedure.instance.student
    .output(z.boolean())
    .query(async ({ ctx: { user } }) => await user.hasSelfDefinedProject()),

  // Move to marking (or kill)
  // TODO: change output type
  // TODO: split into two procedures
  getAllocatedProject: procedure.instance.user
    .input(z.object({ studentId: z.string() }))
    .output(
      z
        .object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          studentRanking: z.number(),
          supervisor: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
          }),
        })
        .optional(),
    )
    .query(async ({ ctx: { db, instance }, input: { studentId } }) => {
      if (!(await instance.isStudent(studentId))) return undefined;

      const student = await instance.getStudent(studentId);

      if (!(await student.hasAllocation())) return undefined;

      const { project, studentRanking } = await student.getAllocation();

      const supervisor = new Supervisor(
        db,
        project.supervisorId,
        instance.params,
      );

      return {
        id: project.id,
        title: project.title,
        description: project.description,
        studentRanking,
        supervisor: await supervisor.get(),
      };
    }),
});
