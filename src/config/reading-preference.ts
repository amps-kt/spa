import { ExtendedReaderPreferenceType } from "@/db/types";

export const readingPreferenceOptions = [
  { id: ExtendedReaderPreferenceType.ACCEPTABLE, displayName: "Acceptable" },
  { id: ExtendedReaderPreferenceType.PREFERRED, displayName: "Preferred" },
  { id: ExtendedReaderPreferenceType.UNACCEPTABLE, displayName: "Rejected" },
];
