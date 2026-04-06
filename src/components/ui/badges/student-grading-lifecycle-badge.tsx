import { cva } from "class-variance-authority";

import { StudentGradingLifecycleState } from "@/dto/marking";

import { cn } from "@/lib/utils";

import { Badge } from "../badge";
import { WithTooltip } from "../tooltip-wrapper";

export const statusIndicatorVariants = cva("", {
  variants: {
    variant: {
      [StudentGradingLifecycleState.CLOSED]: "bg-muted-foreground",
      [StudentGradingLifecycleState.NOT_SUBMITTED]: "bg-gray-700",
      [StudentGradingLifecycleState.DONE]: "bg-green-600",
      [StudentGradingLifecycleState.PENDING]: "bg-sky-500",
      [StudentGradingLifecycleState.ACTION_REQUIRED]: "bg-destructive",
    },
  },
});

// TODO add tip:
const markingStatusData: Record<
  StudentGradingLifecycleState,
  { label: string; tip: string }
> = {
  CLOSED: { label: "Closed", tip: "Marking for this student is closed" },
  DONE: { label: "Done", tip: "Marking for this student is complete" },
  NOT_SUBMITTED: {
    label: "Not Submitted",
    tip: "Marking for this student cannot continue until the student submits ",
  },
  PENDING: { label: "Pending", tip: "Marking for this student is pending" },
  ACTION_REQUIRED: {
    label: "Action Required",
    tip: "Awaiting marks for this student ",
  },
};

export function StudentGradingLifecycleBadge({
  className,
  status,
}: {
  className?: string;
  status: StudentGradingLifecycleState;
}) {
  const { label, tip } = markingStatusData[status];
  return (
    <WithTooltip tip={tip}>
      <div>
        <Badge
          className={cn(
            statusIndicatorVariants({ variant: status }),
            className,
          )}
        >
          {label}
        </Badge>
      </div>
    </WithTooltip>
  );
}
