import { ConsensusMethod } from "@/db/types";

import { Badge } from "../badge";
import { WithTooltip } from "../tooltip-wrapper";

const consensusMethodData: Record<
  ConsensusMethod,
  { label: string; tip: string }
> = {
  [ConsensusMethod.AUTO]: {
    label: "Auto-resolved",
    tip: "The marks for this unit were close enough to resolve automatically.",
  },
  [ConsensusMethod.MODERATED]: {
    label: "Moderated",
    tip: "This unit has been moderated",
  },
  [ConsensusMethod.NEGOTIATED]: {
    label: "Negotiated",
    tip: "This unit has been negotiated",
  },
  [ConsensusMethod.OVERRIDE]: {
    label: "Overridden",
    tip: "The admin overwrote the grade for this unit",
  },
};

export function ConsensusMethodBadge({ method }: { method: ConsensusMethod }) {
  return (
    <WithTooltip tip={consensusMethodData[method].tip}>
      <div>
        <Badge>{consensusMethodData[method].label}</Badge>
      </div>
    </WithTooltip>
  );
}
