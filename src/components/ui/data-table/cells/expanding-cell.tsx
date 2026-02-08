import { type Row } from "@tanstack/react-table";
import { ChevronDownIcon, ChevronLeftIcon } from "lucide-react";

import { Button } from "../../button";
import { WithTooltip } from "../../tooltip-wrapper";

export function ExpandingCell({ row }: { row: Row<unknown> }) {
  return (
    <WithTooltip tip={row.getIsExpanded() ? "Fold breakdown" : "See breakdown"}>
      <Button variant="ghost" onClick={() => row.toggleExpanded()}>
        {row.getIsExpanded() ? (
          <ChevronDownIcon className="size-4" />
        ) : (
          <ChevronLeftIcon className="size-4" />
        )}
      </Button>
    </WithTooltip>
  );
}
