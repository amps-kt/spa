import { type ReactNode } from "react";

import { ExtendedReaderPreferenceType } from "@/db/types";

export const preferenceConfigs: Record<
  ExtendedReaderPreferenceType,
  { label: string; tip: ReactNode }
> = {
  [ExtendedReaderPreferenceType.ACCEPTABLE]: {
    label: "Neutral",
    tip: (
      <p>
        Project is currently considered{" "}
        <span className="font-semibold">Neutral</span>, click to change status
        to <span className="font-semibold">Preferred</span>
      </p>
    ),
  },
  [ExtendedReaderPreferenceType.PREFERRED]: {
    label: "Preferred",
    tip: (
      <p>
        Project is currently considered{" "}
        <span className="font-semibold">Preferred</span>, click to change status
        to <span className="font-semibold">Unacceptable</span>
      </p>
    ),
  },
  [ExtendedReaderPreferenceType.UNACCEPTABLE]: {
    label: "Not Preferred",
    tip: (
      <p>
        Project is currently considered{" "}
        <span className="font-semibold">Not Preferred</span>, click to change
        status to <span className="font-semibold">Neutral</span>
      </p>
    ),
  },
};

export const preferenceOrder = [
  ExtendedReaderPreferenceType.ACCEPTABLE,
  ExtendedReaderPreferenceType.PREFERRED,
  ExtendedReaderPreferenceType.UNACCEPTABLE,
];

export function nextPrefType(current: ExtendedReaderPreferenceType) {
  const currentIndex = preferenceOrder.indexOf(current);
  const nextIndex = (currentIndex + 1) % preferenceOrder.length;
  return preferenceOrder[nextIndex];
}
