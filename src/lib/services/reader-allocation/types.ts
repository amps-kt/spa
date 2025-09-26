import z from "zod";

const projectIdSchema = z.string();
const readerIdSchema = z.string();

const matchingReaderSchema = z.object({
  id: readerIdSchema,
  // acceptable is implicit
  preferable: projectIdSchema.array(),
  unacceptable: projectIdSchema.array(),
  conflict: projectIdSchema.array(),
  capacity: z.number(),
});

export const matchingInputSchema = z.object({
  allProjects: projectIdSchema.array(),
  allReaders: matchingReaderSchema.array(),
});

export type MatchingInput = z.infer<typeof matchingInputSchema>;

const matchingPairSchema = z.object({
  readerId: readerIdSchema,
  projectId: projectIdSchema,
});

export const matchingOutputSchema = z.object({
  assignments: matchingPairSchema.array(),
  unassignedProjects: projectIdSchema.array(),
  load: z.record(readerIdSchema, z.int()),
});

export type MatchingOutput = z.infer<typeof matchingOutputSchema>;

export interface IReaderAllocator {
  allocate(inputData: MatchingInput): Promise<MatchingOutput>;
}
