import { useState } from "react";

import {
  ExtendedReaderPreferenceType,
  type MaybeReaderPreferenceType,
} from "@/db/types";

import { Button } from "@/components/ui/button";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { cn } from "@/lib/utils";
import { fromExtended, toExtended } from "@/lib/utils/reader-preference";

import { preferenceOrder, preferenceConfigs } from "./config";

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
  const [current, setCurrent] = useState<ExtendedReaderPreferenceType>(
    toExtended(currentPreference),
  );

  async function onPreferenceChange() {
    const currentIndex = preferenceOrder.indexOf(current);
    const nextIndex = (currentIndex + 1) % preferenceOrder.length;
    const nextPreference = preferenceOrder[nextIndex];

    const changedTo = await handleToggle(fromExtended(nextPreference));
    setCurrent(toExtended(changedTo));
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
