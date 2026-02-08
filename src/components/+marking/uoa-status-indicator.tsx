import { Badge } from "../ui/badge";
import { WithTooltip } from "../ui/tooltip-wrapper";

import { type UnitMarkingStatus } from "./types";

const markingStatusData: Record<
  UnitMarkingStatus,
  { label: string; tip: string; badgeStyle: string }
> = {
  CLOSED: {
    label: "Closed",
    tip: "This unit of assessment is not yet open for marking",
    badgeStyle: "bg-gray-400",
  },
  REQUIRES_MARKING: {
    label: "Requires Marking",
    tip: "You must submit your marks for this unit",
    badgeStyle: "bg-red-500",
  },
  IN_NEGOTIATION: {
    label: "In Negotiation",
    tip: "Negotiation is required; contact the 2nd marker",
    badgeStyle: "bg-red-500",
  },
  IN_MODERATION: {
    label: "In Moderation",
    tip: "Moderation required; the coordinator will contact you",
    badgeStyle: "bg-red-500",
  },
  PENDING_2ND_MARKER: {
    label: "Pending 2nd Marker",
    tip: "The 2nd marker must submit their marks to progress",
    badgeStyle: "bg-sky-400",
  },
  DONE: {
    label: "Done",
    tip: "This unit has been marked",
    badgeStyle: "bg-green-400",
  },
  AUTO_RESOLVED: {
    label: "Auto-Resolved",
    tip: "The marks for this unit have been automatically resolved",
    badgeStyle: "bg-green-400",
  },
  NEGOTIATED: {
    label: "Negotiated",
    tip: "The marks for this unit were resolved through negotiation",
    badgeStyle: "bg-green-400",
  },
  MODERATED: {
    label: "Moderated",
    tip: "The marks for this unit were moderated",
    badgeStyle: "bg-green-400",
  },
};

export function UoaStatusIndicator({ status }: { status: UnitMarkingStatus }) {
  const { label, badgeStyle, tip } = markingStatusData[status];
  return (
    <WithTooltip tip={tip}>
      <div>
        <Badge className={badgeStyle}>{label}</Badge>
      </div>
    </WithTooltip>
  );
}
