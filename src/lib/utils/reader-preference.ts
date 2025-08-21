import { ExtendedReaderPreferenceType, ReaderPreferenceType } from "@/db/types";

export function toExtended(
  type: ReaderPreferenceType | undefined,
): ExtendedReaderPreferenceType {
  switch (type) {
    case undefined:
      return ExtendedReaderPreferenceType.ACCEPTABLE;
    case ReaderPreferenceType.PREFERRED:
      return ExtendedReaderPreferenceType.PREFERRED;
    case ReaderPreferenceType.UNACCEPTABLE:
      return ExtendedReaderPreferenceType.UNACCEPTABLE;
  }
}

export function fromExtended(
  type: ExtendedReaderPreferenceType,
): ReaderPreferenceType | undefined {
  switch (type) {
    case ExtendedReaderPreferenceType.ACCEPTABLE:
      return undefined;
    case ExtendedReaderPreferenceType.PREFERRED:
      return ReaderPreferenceType.PREFERRED;
    case ExtendedReaderPreferenceType.UNACCEPTABLE:
      return ReaderPreferenceType.UNACCEPTABLE;
  }
}

export const readingPreferenceOptions = [
  { id: ExtendedReaderPreferenceType.ACCEPTABLE, displayName: "Acceptable" },
  { id: ExtendedReaderPreferenceType.PREFERRED, displayName: "Preferred" },
  { id: ExtendedReaderPreferenceType.UNACCEPTABLE, displayName: "Rejected" },
];
