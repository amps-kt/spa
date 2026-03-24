"use client";

import { PenIcon } from "lucide-react";

import { Stage } from "@/db/types";

import { ConditionalRender } from "@/components/access-control";
import { FormatDenials } from "@/components/access-control/format-denial";
import { Button, buttonVariants } from "@/components/ui/button";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { AppInstanceLink } from "@/lib/routing";
import { cn } from "@/lib/utils";

export function EditButton({ studentId }: { studentId: string }) {
  return (
    <ConditionalRender
      allowedStages={[Stage.STUDENT_BIDDING]}
      allowed={
        <AppInstanceLink
          className={cn(
            buttonVariants({ variant: "outline" }),
            "flex items-center justify-center gap-2 text-nowrap",
          )}
          page="studentPreferences"
          linkArgs={{ studentId }}
        >
          <PenIcon className="h-4 w-4" />
          <p>Edit Student Preferences</p>
        </AppInstanceLink>
      }
      denied={(denialData) => (
        <WithTooltip
          tip={
            <FormatDenials
              {...denialData}
              action="Updating student preferences"
            />
          }
          forDisabled
        >
          <Button
            disabled
            variant="outline"
            className={cn("flex items-center justify-center gap-2 text-nowrap")}
          >
            <PenIcon className="h-4 w-4" />
            <p>Edit Student Preferences</p>
          </Button>
        </WithTooltip>
      )}
    />
  );
}
