import { unitToOverall, UnitGradingLifecycleState } from "@/dto/marking";

import { Badge } from "../badge";
import { WithTooltip } from "../tooltip-wrapper";

import { statusIndicatorVariants } from "./student-grading-lifecycle-badge";

const markingStatusData: Record<
  UnitGradingLifecycleState,
  { label: string; tip: string }
> = {
  [UnitGradingLifecycleState.CLOSED]: {
    label: "Closed",
    tip: "This unit of assessment is not yet open for marking",
  },
  [UnitGradingLifecycleState.NOT_SUBMITTED]: {
    label: "Not Submitted",
    tip: "The material for this unit of assessment has not yet been submitted",
  },
  [UnitGradingLifecycleState.REQUIRES_MARKING]: {
    label: "Requires Marking",
    tip: "You must submit your marks for this unit",
  },
  [UnitGradingLifecycleState.IN_NEGOTIATION]: {
    label: "In Negotiation",
    tip: "Negotiation is required; contact the 2nd marker",
  },
  [UnitGradingLifecycleState.IN_MODERATION]: {
    label: "In Moderation",
    tip: "Moderation required; the coordinator will contact you",
  },
  [UnitGradingLifecycleState.IN_MODERATION_AFTER_NEGOTIATION]: {
    label: "In Moderation",
    tip: "Moderation required; the coordinator will contact you",
  },
  [UnitGradingLifecycleState.PENDING_2ND_MARKER]: {
    label: "Pending 2nd Marker",
    tip: "The 2nd marker must submit their marks to progress",
  },
  [UnitGradingLifecycleState.DONE]: {
    label: "Done",
    tip: "This unit has been marked",
  },
  [UnitGradingLifecycleState.AUTO_RESOLVED]: {
    label: "Auto-Resolved",
    tip: "The marks for this unit have been automatically resolved",
  },
  [UnitGradingLifecycleState.RESOLVED_BY_NEGOTIATION]: {
    label: "Negotiated",
    tip: "The marks for this unit were resolved through negotiation",
  },
  [UnitGradingLifecycleState.RESOLVED_BY_MODERATION]: {
    label: "Moderated",
    tip: "The marks for this unit were moderated",
  },
};

export function UnitGradingLifecycleBadge({
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
