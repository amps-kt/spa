"use client";

import { useMemo } from "react";

import { cva } from "class-variance-authority";

import { ExtendedReaderPreferenceType } from "@/db/types";

import { Button } from "@/components/ui/button";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { cn } from "@/lib/utils";

import { preferenceConfigs, nextPrefType } from "./config";

const readingPreferenceButtonVariants = cva(
  "transition-all duration-200 border-2 font-medium flex items-center justify-start gap-2 hover:cursor-pointer w-36",
  {
    variants: {
      variant: {
        [ExtendedReaderPreferenceType.ACCEPTABLE]:
          "text-amber-800 bg-amber-100 border-amber-300 hover:bg-amber-200 [--dot-color:theme(colors.amber.500)]",
        [ExtendedReaderPreferenceType.PREFERRED]:
          "text-green-800 bg-green-100 border-green-300 hover:bg-green-200 [--dot-color:theme(colors.green.500)]",
        [ExtendedReaderPreferenceType.UNACCEPTABLE]:
          "text-red-800 bg-red-100 border-red-300 hover:bg-red-200 [--dot-color:theme(colors.red.500)]",
      },
    },
    defaultVariants: { variant: ExtendedReaderPreferenceType.ACCEPTABLE },
  },
);

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

  const { tip, label } = useMemo(
    () => preferenceConfigs[currentPreference],
    [currentPreference],
  );

  return (
    <WithTooltip tip={tip}>
      <Button
        onClick={onPreferenceChange}
        variant="outline"
        size="sm"
        className={cn(
          readingPreferenceButtonVariants({ variant: currentPreference }),
          className,
        )}
      >
        <div className="w-3 h-3 rounded-full bg-[var(--dot-color)]" />
        <p className="mx-auto">{label}</p>
      </Button>
    </WithTooltip>
  );
}

export function ReadingPreferenceDisplay({
  currentPreference,
  className,
}: {
  currentPreference: ExtendedReaderPreferenceType;
  className?: string;
}) {
  const { label } = preferenceConfigs[currentPreference];

  return (
    <WithTooltip tip={`Reader found this project ${label}.`}>
      <Button
        variant="outline"
        size="sm"
        className={cn(
          readingPreferenceButtonVariants({ variant: currentPreference }),
          className,
        )}
      >
        <div className="w-3 h-3 rounded-full bg-[var(--dot-color)]" />
        <p className="mx-auto">{label}</p>
      </Button>
    </WithTooltip>
  );
}
