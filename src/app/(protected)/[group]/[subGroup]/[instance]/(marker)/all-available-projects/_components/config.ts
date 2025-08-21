import { ExtendedReaderPreferenceType } from "@/db/types";

export const preferenceConfigs: Record<
  ExtendedReaderPreferenceType,
  {
    label: string;
    tip: string;
    color: string;
    bgColor: string;
    hoverColor: string;
  }
> = {
  [ExtendedReaderPreferenceType.ACCEPTABLE]: {
    label: "Acceptable",
    tip: "Project is currently considered acceptable, click to change status to Preferred",
    color: "text-amber-800",
    bgColor: "bg-amber-100 border-amber-300",
    hoverColor: "hover:bg-amber-200",
  },
  [ExtendedReaderPreferenceType.PREFERRED]: {
    label: "Preferred",
    tip: "Click to change preference",
    color: "text-green-800",
    bgColor: "bg-green-100 border-green-300",
    hoverColor: "hover:bg-green-200",
  },
  [ExtendedReaderPreferenceType.UNACCEPTABLE]: {
    label: "Rejected",
    tip: "Click to change preference",
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
