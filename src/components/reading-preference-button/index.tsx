"use client";

import { useMemo } from "react";

import { ExtendedReaderPreferenceType } from "@/db/types";

import { Button } from "@/components/ui/button";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { cn } from "@/lib/utils";

import { preferenceConfigs, nextPrefType } from "./config";

export function ReadingPreferenceButton({
  currentPreference,
  setPreference,
  className,
}: {
  currentPreference: ExtendedReaderPreferenceType;
  setPreference: (type: ExtendedReaderPreferenceType) => Promise<void>;
  className?: string;
}) {
  async function onPreferenceChange() {
    await setPreference(nextPrefType(currentPreference));
  }

  const config = useMemo(
    () => preferenceConfigs[currentPreference],
    [currentPreference],
  );

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
            currentPreference === ExtendedReaderPreferenceType.ACCEPTABLE &&
              "bg-amber-500",
            currentPreference === ExtendedReaderPreferenceType.PREFERRED &&
              "bg-green-500",
            currentPreference === ExtendedReaderPreferenceType.UNACCEPTABLE &&
              "bg-red-500",
          )}
        />
        <p>{config.label}</p>
      </Button>
    </WithTooltip>
  );
}
