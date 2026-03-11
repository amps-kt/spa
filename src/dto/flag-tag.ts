import { z } from "zod";

export const flagDtoSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  description: z.string(),
  layoutIndex: z.number(),
});

export type FlagDTO = z.infer<typeof flagDtoSchema>;

export const tagDtoSchema = z.object({ id: z.string(), title: z.string() });

export type TagDTO = z.infer<typeof tagDtoSchema>;
