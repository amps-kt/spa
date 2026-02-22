import { cva } from "class-variance-authority";

import { StudentGradingLifecycleState } from "@/dto/marking";

import { Badge } from "../ui/badge";
import { WithTooltip } from "../ui/tooltip-wrapper";

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

const markingStatusData: Record<
  StudentGradingLifecycleState,
  { label: string; tip: string }
> = {
  CLOSED: { label: "Closed", tip: "" },
  DONE: { label: "Done", tip: "" },
  NOT_SUBMITTED: { label: "Not Submitted", tip: "" },
  PENDING: { label: "Pending", tip: "" },
  ACTION_REQUIRED: { label: "Action Required", tip: "" },
};

export function OverallStatusIndicator({
  status,
}: {
  status: StudentGradingLifecycleState;
}) {
  const { label, tip } = markingStatusData[status];
  return (
    <WithTooltip tip={tip}>
      <div>
        <Badge className={statusIndicatorVariants({ variant: status })}>
          {label}
        </Badge>
      </div>
    </WithTooltip>
  );
}
