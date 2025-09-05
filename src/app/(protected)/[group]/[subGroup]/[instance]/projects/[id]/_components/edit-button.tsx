"use client";

import { PenIcon } from "lucide-react";
import Link from "next/link";

import { type ProjectDTO } from "@/dto";

import { Stage } from "@/db/types";

import { ConditionalRender } from "@/components/access-control/conditional-render";
import { FormatDenials } from "@/components/access-control/format-denial";
import { usePathInInstance } from "@/components/params-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { cn } from "@/lib/utils";
import { previousStages } from "@/lib/utils/permissions/stage-check";

export function EditButton({ project }: { project: ProjectDTO }) {
  const { getPath } = usePathInInstance();

  return (
    <ConditionalRender
      allowedStages={previousStages(Stage.STUDENT_BIDDING)}
      allowed={
        <WithTooltip tip="Edit or Delete">
          <Link
            className={cn(
              buttonVariants({ size: "icon" }),
              "hover:text-primary-foreground",
            )}
            href={getPath(`projects/${project.id}/edit`)}
          >
            <PenIcon className="size-5" />
          </Link>
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
