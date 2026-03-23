"use client";

import { PenIcon } from "lucide-react";

import { type ProjectDTO } from "@/dto";

import { Stage } from "@/db/types";

import { ConditionalRender } from "@/components/access-control/conditional-render";
import { FormatDenials } from "@/components/access-control/format-denial";
import { Button, buttonVariants } from "@/components/ui/button";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { AppInstanceLink } from "@/lib/routing";
import { cn } from "@/lib/utils";
import { previousStages } from "@/lib/utils/permissions/stage-check";

export function EditButton({ project }: { project: ProjectDTO }) {
  return (
    <ConditionalRender
      allowedStages={previousStages(Stage.STUDENT_BIDDING)}
      allowed={
        <WithTooltip tip="Edit or Delete">
          <AppInstanceLink
            className={cn(
              buttonVariants({ size: "icon" }),
              "hover:text-primary-foreground",
            )}
            page="editProject"
            linkArgs={{ projectId: project.id }}
          >
            <PenIcon className="size-5" />
          </AppInstanceLink>
        </WithTooltip>
      }
      denied={(denialData) => (
        <WithTooltip
          tip={<FormatDenials action="Project editing" {...denialData} />}
          forDisabled
        >
          <Button size="icon" disabled>
            <PenIcon className="size-5" />
          </Button>
        </WithTooltip>
      )}
    />
  );
}
