import { z } from "zod";

import { readerDtoSchema } from "@/dto";

import { Reader } from "@/data-objects";

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
});
