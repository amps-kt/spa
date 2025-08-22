import { type ReactNode } from "react";

import { ExtendedReaderPreferenceType } from "@/db/types";

export const preferenceConfigs: Record<
  ExtendedReaderPreferenceType,
  {
    label: string;
    tip: () => ReactNode;
    color: string;
    bgColor: string;
    hoverColor: string;
  }
> = {
  [ExtendedReaderPreferenceType.ACCEPTABLE]: {
    label: "Acceptable",
    tip: () => (
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
    tip: () => (
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
    tip: () => (
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
