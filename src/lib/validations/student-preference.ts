import { z } from "zod";

import { PreferenceType } from "@/db/types";

export const studentPreferenceSchema = z
  .enum(PreferenceType)
  .or(z.literal("None"));

export type StudentPreferenceType = z.infer<typeof studentPreferenceSchema>;

// TODO: this is a bit silly, fix this later
export function convertPreferenceType(
  preferenceType: StudentPreferenceType,
): PreferenceType | undefined {
  return preferenceType === "None" ? undefined : preferenceType;
}
