import { cva } from "class-variance-authority";

import { OverallMarkingStatus } from "@/dto/marking";

import { Badge } from "../ui/badge";
import { WithTooltip } from "../ui/tooltip-wrapper";

export const statusIndicatorVariants = cva("", {
  variants: {
    variant: {
      [OverallMarkingStatus.CLOSED]: "bg-muted-foreground",
      [OverallMarkingStatus.NOT_SUBMITTED]: "bg-gray-700",
      [OverallMarkingStatus.DONE]: "bg-green-600",
      [OverallMarkingStatus.PENDING]: "bg-sky-500",
      [OverallMarkingStatus.ACTION_REQUIRED]: "bg-destructive",
    },
  },
});

const markingStatusData: Record<
  OverallMarkingStatus,
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
  status: OverallMarkingStatus;
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
