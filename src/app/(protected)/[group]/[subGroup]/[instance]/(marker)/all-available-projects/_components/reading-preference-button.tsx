import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  ExtendedReaderPreferenceType,
  type MaybeReaderPreferenceType,
} from "@/db/types";

import { Button } from "@/components/ui/button";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { cn } from "@/lib/utils";
import { fromExtended, toExtended } from "@/lib/utils/reader-preference";

const preferenceConfigs: Record<
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

const preferenceOrder = [
  ExtendedReaderPreferenceType.ACCEPTABLE,
  ExtendedReaderPreferenceType.PREFERRED,
  ExtendedReaderPreferenceType.UNACCEPTABLE,
];

export function ReadingPreferenceButton({
  currentPreference,
  handleToggle,
  className,
}: {
  currentPreference: MaybeReaderPreferenceType;
  handleToggle: (
    type: MaybeReaderPreferenceType,
  ) => Promise<MaybeReaderPreferenceType>;
  className?: string;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<ExtendedReaderPreferenceType>(
    toExtended(currentPreference),
  );

  async function onPreferenceChange() {
    const currentIndex = preferenceOrder.indexOf(current);
    const nextIndex = (currentIndex + 1) % preferenceOrder.length;
    const nextPreference = preferenceOrder[nextIndex];

    const changedTo = await handleToggle(fromExtended(nextPreference));
    setCurrent(toExtended(changedTo));
    router.refresh();
  }

  const config =
    preferenceConfigs[current ?? ExtendedReaderPreferenceType.ACCEPTABLE];

  return (
    <WithTooltip tip={config.tip}>
      <Button
        onClick={onPreferenceChange}
        variant="outline"
        size="sm"
        className={cn(
          "transition-all duration-200 border-2 font-medium flex items-center gap-2 hover:cursor-pointer",
          config.color,
          config.bgColor,
          config.hoverColor,
          className,
        )}
      >
        <div
          className={cn(
            "w-3 h-3 rounded-full",
            current === ExtendedReaderPreferenceType.ACCEPTABLE &&
              "bg-amber-500",
            current === ExtendedReaderPreferenceType.PREFERRED &&
              "bg-green-500",
            current === ExtendedReaderPreferenceType.UNACCEPTABLE &&
              "bg-red-500",
          )}
        />
        <p>{config.label}</p>
      </Button>
    </WithTooltip>
  );
}
