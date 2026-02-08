import { Badge } from "../ui/badge";
import { WithTooltip } from "../ui/tooltip-wrapper";

import { type OverallMarkingStatus } from "./types";

const markingStatusData: Record<
  OverallMarkingStatus,
  { label: string; tip: string; badgeStyle: string }
> = {
  CLOSED: { label: "Closed", tip: "--", badgeStyle: "bg-gray-400" },

  DONE: {
    label: "Done",
    tip: "This unit has been marked",
    badgeStyle: "bg-green-400",
  },
  NOT_SUBMITTED: { label: "Not Submitted", tip: "", badgeStyle: "bg-gray-700" },
  PENDING: { label: "Pending", tip: "", badgeStyle: "bg-sky-400" },
  ACTION_REQUIRED: {
    label: "Action Required",
    tip: "",
    badgeStyle: "bg-red-500", // help colours hard
  },
};

export function OverallStatusIndicator({
  status,
}: {
  status: OverallMarkingStatus;
}) {
  const { label, badgeStyle, tip } = markingStatusData[status];
  return (
    <WithTooltip tip={tip}>
      <div>
        <Badge className={badgeStyle}>{label}</Badge>
      </div>
    </WithTooltip>
  );
}
