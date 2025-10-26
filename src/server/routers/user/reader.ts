import { z } from "zod";

import { projectDtoSchema, readerDtoSchema, studentDtoSchema } from "@/dto";

import { Reader } from "@/data-objects";

import { extendedReaderPreferenceTypeSchema, Role } from "@/db/types";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

export const readerRouter = createTRPCRouter({
  exists: procedure.instance.user
    .input(z.object({ readerId: z.string() }))
    .output(z.boolean())
    .query(
      async ({ ctx: { instance }, input: { readerId } }) =>
        await instance.isReader(readerId),
    ),

  getById: procedure.instance.subGroupAdmin
    .input(z.object({ readerId: z.string() }))
    .output(readerDtoSchema)
    .query(async ({ ctx: { instance }, input: { readerId } }) => {
      const reader = await instance.getReader(readerId);
      return await reader.toDTO();
    }),

  getReadingPreferences: procedure.instance.reader
    .output(
      z.array(
        z.object({
          project: projectDtoSchema,
          student: studentDtoSchema,
          type: extendedReaderPreferenceTypeSchema,
        }),
      ),
    )
    .query(async ({ ctx: { user } }) => await user.getPreferences()),

  updateReadingPreference: procedure.instance.reader
    .input(
      z.object({
        projectId: z.string(),
        readingPreference: extendedReaderPreferenceTypeSchema,
      }),
    )
    .output(extendedReaderPreferenceTypeSchema)
    .mutation(
      async ({ ctx: { user }, input: { projectId, readingPreference } }) =>
        await user.updateReadingPreference(projectId, readingPreference),
    ),

  updateInstanceCapacities: procedure.instance.subGroupAdmin
    .input(
      z.object({ readerId: z.string(), capacities: Reader.capacitiesSchema }),
    )
    .output(readerDtoSchema)
    .mutation(
      async ({ ctx: { instance, audit }, input: { readerId, capacities } }) => {
        audit("Updated reader capacities", { readerId, capacities });
        const reader = await instance.getReader(readerId);
        return reader.setCapacityDetails(capacities);
      },
    ),

  getReadingAllocations: procedure.instance
    .withRoles([Role.ADMIN, Role.READER])
    .input(z.object({ readerId: z.string() }))
    .output(
      z.array(
        z.object({ project: projectDtoSchema, student: studentDtoSchema }),
      ),
    )
    .query(async ({ ctx: { instance }, input: { readerId } }) => {
      const reader = await instance.getReader(readerId);
      return reader.getAllocations();
    }),
});
