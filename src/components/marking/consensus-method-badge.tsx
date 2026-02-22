import { MarkingMethod } from "@/db/types";

import { Badge } from "../ui/badge";
import { WithTooltip } from "../ui/tooltip-wrapper";

const consensusMethodData: Record<
  MarkingMethod,
  { label: string; tip: string }
> = {
  [MarkingMethod.AUTO]: {
    label: "Auto-resolved",
    tip: "The marks for this unit were close enough to resolve automatically.",
  },
  [MarkingMethod.MODERATED]: {
    label: "Moderated",
    tip: "This unit has been moderated",
  },
  [MarkingMethod.NEGOTIATED]: {
    label: "Negotiated",
    tip: "This unit has been negotiated",
  },
  [MarkingMethod.OVERRIDE]: {
    label: "Overridden",
    tip: "The admin overwrote the grade for this unit",
  },
};

export function ConsensusMethodBadge({ method }: { method: MarkingMethod }) {
  return (
    <WithTooltip tip={consensusMethodData[method].tip}>
      <div>
        <Badge>{consensusMethodData[method].label}</Badge>
      </div>
    </WithTooltip>
  );
}
