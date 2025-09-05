import { z } from "zod";

import { computeProjectSubmissionTarget } from "@/config/submission-target";

import {
  instanceDtoSchema,
  projectDtoSchema,
  studentDtoSchema,
  supervisorDtoSchema,
} from "@/dto";

import { Role } from "@/db/types";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

import { instanceParamsSchema } from "@/lib/validations/params";
import { supervisorCapacitiesSchema } from "@/lib/validations/supervisor-project-submission-details";

export const supervisorRouter = createTRPCRouter({
  exists: procedure.instance.user
    .input(z.object({ supervisorId: z.string() }))
    .output(z.boolean())
    .query(
      async ({ ctx: { instance }, input: { supervisorId } }) =>
        await instance.isSupervisor(supervisorId),
    ),

  getById: procedure.instance.subGroupAdmin
    .input(z.object({ supervisorId: z.string() }))
    .output(supervisorDtoSchema)
    .query(async ({ ctx: { instance }, input: { supervisorId } }) => {
      const supervisor = await instance.getSupervisor(supervisorId);
      return await supervisor.toDTO();
    }),

  allocationAccess: procedure.instance.supervisor
    .output(z.boolean())
    .query(async ({ ctx: { instance } }) => {
      const { supervisorAllocationAccess } = await instance.get();
      return supervisorAllocationAccess;
    }),

  // Move
  setAllocationAccess: procedure.instance.subGroupAdmin
    .input(z.object({ access: z.boolean() }))
    .output(z.boolean())
    .mutation(async ({ ctx: { instance, audit }, input: { access } }) => {
      audit("Set supervisor allocation access", { access });
      return await instance.setSupervisorPublicationAccess(access);
    }),

  instanceProjects: procedure.instance.subGroupAdmin
    .input(z.object({ supervisorId: z.string() }))
    .output(
      z.array(
        z.object({
          project: projectDtoSchema,
          allocatedStudent: studentDtoSchema.optional(),
        }),
      ),
    )
    .query(async ({ ctx: { instance }, input: { supervisorId } }) => {
      const supervisor = await instance.getSupervisor(supervisorId);
      return await supervisor.getProjectsWithStudentAllocation();
    }),

  projectStats: procedure.instance.supervisor
    .output(
      z.object({
        currentSubmissionCount: z.number(),
        submissionTarget: z.number(),
      }),
    )
    .query(async ({ ctx: { user } }) => {
      const allProjects = await user.getProjectsInInstance();
      const { projectTarget: target } = await user.getCapacityDetails();

      const totalCount = await user
        .getSupervisionAllocations()
        .then((allocations) => allocations.length);

      return {
        currentSubmissionCount: allProjects.length,
        submissionTarget: computeProjectSubmissionTarget(target, totalCount),
      };
    }),

  // TODO review this. Related to ![#c026d3]
  rowProjects: procedure.instance.supervisor
    .output(
      z.array(
        z.object({
          project: projectDtoSchema,
          student: studentDtoSchema.optional(),
        }),
      ),
    )
    .query(async ({ ctx: { user } }) => {
      const supervisorProjects = await user.getProjectsInInstance();

      return supervisorProjects.flatMap((p) => {
        if (p.allocatedStudents.length === 0) {
          return [{ project: p.project }];
        }

        return p.allocatedStudents.map((s) => ({
          project: p.project,
          student: s,
        }));
      });
    }),

  updateInstanceCapacities: procedure.instance.subGroupAdmin
    .input(
      z.object({
        supervisorId: z.string(),
        capacities: supervisorCapacitiesSchema,
      }),
    )
    .output(supervisorCapacitiesSchema)
    .mutation(
      async ({
        ctx: { instance, audit },
        input: { supervisorId, capacities },
      }) => {
        audit("Updated supervisor capacities", { supervisorId, capacities });
        const supervisor = await instance.getSupervisor(supervisorId);
        return supervisor.setCapacityDetails(capacities);
      },
    ),

  allocations: procedure.instance.supervisor
    .output(
      z.array(
        z.object({
          project: projectDtoSchema,
          student: studentDtoSchema,
          rank: z.number(),
        }),
      ),
    )
    .query(async ({ ctx: { user } }) => user.getSupervisionAllocations()),

  getPreviousProjects: procedure.instance
    .withAC({ allowedRoles: [Role.SUPERVISOR, Role.ADMIN] })
    .input(z.object({ params: instanceParamsSchema, supervisorId: z.string() }))
    .output(
      z.array(
        z.object({
          instanceData: instanceDtoSchema,
          project: projectDtoSchema,
          supervisor: supervisorDtoSchema,
        }),
      ),
    )
    .query(async ({ ctx: { instance }, input: { supervisorId } }) => {
      const supervisor = await instance.getSupervisor(supervisorId);
      const projects = await supervisor.getProjectsInGroup();
      const supervisorData = await supervisor.toDTO();

      return projects.map(({ project, instanceData }) => ({
        project,
        supervisor: supervisorData,
        instanceData,
      }));
    }),
});
