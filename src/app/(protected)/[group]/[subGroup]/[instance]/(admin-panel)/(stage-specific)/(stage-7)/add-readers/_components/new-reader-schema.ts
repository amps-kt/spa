import { z } from "zod";

import { institutionIdSchema } from "@/lib/validations/institution-id";

export const newReaderSchema = z.object({
  fullName: z
    .string("Please enter a valid name")
    .min(1, "Please enter a valid name"),
  institutionId: institutionIdSchema,
  email: z
    .email("Please enter a valid email address")
    .min(1, "Please enter a valid email address")
    .transform((x) => x.toLowerCase()),
  workloadQuota: z.coerce
    .number<number>({
      error: (issue) =>
        issue.input === undefined ? "Required" : "Invalid integer",
    })
    .int("Please enter an integer for the workload quota")
    .nonnegative("Workload quota must be a non-negative integer"),
});

// for CSV parsing - validates reader data from CSV
export const csvReaderSchema = newReaderSchema;

export type NewReader = z.infer<typeof newReaderSchema>;
