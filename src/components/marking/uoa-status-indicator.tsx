import { unitToOverall, type UnitGradingLifecycleState } from "@/dto/marking";

import { Badge } from "../ui/badge";
import { WithTooltip } from "../ui/tooltip-wrapper";

import { statusIndicatorVariants } from "./overall-status-indicator";

const markingStatusData: Record<
  UnitGradingLifecycleState,
  { label: string; tip: string }
> = {
  CLOSED: {
    label: "Closed",
    tip: "This unit of assessment is not yet open for marking",
  },
  NOT_SUBMITTED: {
    label: "Not Submitted",
    tip: "The material for this unit of assessment has not yet been submitted",
  },
  REQUIRES_MARKING: {
    label: "Requires Marking",
    tip: "You must submit your marks for this unit",
  },
  IN_NEGOTIATION: {
    label: "In Negotiation",
    tip: "Negotiation is required; contact the 2nd marker",
  },
  IN_MODERATION: {
    label: "In Moderation",
    tip: "Moderation required; the coordinator will contact you",
  },
  PENDING_2ND_MARKER: {
    label: "Pending 2nd Marker",
    tip: "The 2nd marker must submit their marks to progress",
  },
  DONE: { label: "Done", tip: "This unit has been marked" },
  AUTO_RESOLVED: {
    label: "Auto-Resolved",
    tip: "The marks for this unit have been automatically resolved",
  },
  RESOLVED_BY_NEGOTIATION: {
    label: "Negotiated",
    tip: "The marks for this unit were resolved through negotiation",
  },
  RESOLVED_BY_MODERATION: {
    label: "Moderated",
    tip: "The marks for this unit were moderated",
  },
};

export function UoaStatusIndicator({
  status,
}: {
  status: UnitGradingLifecycleState;
}) {
  const { label, tip } = markingStatusData[status];
  return (
    <WithTooltip tip={tip}>
      <div>
        <Badge
          className={statusIndicatorVariants({
            variant: unitToOverall(status),
          })}
        >
          {label}
        </Badge>
      </div>
    </WithTooltip>
  );
}
