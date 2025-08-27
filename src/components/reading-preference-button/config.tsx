import { type ReactNode } from "react";

import { cva } from "class-variance-authority";

import { ExtendedReaderPreferenceType, ReaderPreferenceType } from "@/db/types";

// ? could maybe use this to toggle between states instead of the weird config object?
// ? though I do like the config object for the labels and tip
// ? thoughts @JakeTrevor
export const readingPreferenceButtonVariants = cva(
  "transition-all duration-200 border-2 font-medium flex items-center gap-2",
  {
    variants: {
      variant: {
        default:
          "text-amber-800 bg-amber-100 border-amber-300 hover:bg-amber-200",
        [ReaderPreferenceType.PREFERRED]:
          "text-green-800 bg-green-100 border-green-300 hover:bg-green-200",
        [ReaderPreferenceType.UNACCEPTABLE]:
          "text-red-800 bg-red-100 border-red-300 hover:bg-red-200",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export const preferenceConfigs: Record<
  ExtendedReaderPreferenceType,
  {
    label: string;
    tip: ReactNode;
    color: string;
    bgColor: string;
    hoverColor: string;
  }
> = {
  [ExtendedReaderPreferenceType.ACCEPTABLE]: {
    label: "Acceptable",
    tip: (
      <p>
        Project is currently considered{" "}
        <span className="font-semibold">Acceptable</span>, click to change
        status to <span className="font-semibold">Preferred</span>
      </p>
    ),
    color: "text-amber-800",
    bgColor: "bg-amber-100 border-amber-300",
    hoverColor: "hover:bg-amber-200",
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
    color: "text-green-800",
    bgColor: "bg-green-100 border-green-300",
    hoverColor: "hover:bg-green-200",
  },
  [ExtendedReaderPreferenceType.UNACCEPTABLE]: {
    label: "Unacceptable",
    tip: (
      <p>
        Project is currently considered{" "}
        <span className="font-semibold">Unacceptable</span>, click to change
        status to <span className="font-semibold">Acceptable</span>
      </p>
    ),
    color: "text-red-800",
    bgColor: "bg-red-100 border-red-300",
    hoverColor: "hover:bg-red-200",
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
