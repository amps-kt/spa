import { Badge } from "@/components/ui/badge";

import { FormatPercent } from "@/lib/formatting/percent";
import { cn } from "@/lib/utils";

export function WeightBadge({
  weight,
  totalWeight,
  variant,
  className,
}: {
  weight: number;
  totalWeight: number;
  variant: "outline" | "secondary";
  className?: string;
}) {
  const pct = totalWeight > 0 ? weight / totalWeight : 0;

  return (
    <Badge
      variant={variant}
      className={cn(
        "text-xs rounded-sm px-1.5 w-25 flex justify-center",
        className,
      )}
    >
      w:{weight} ({FormatPercent(pct)})
    </Badge>
  );
}

export function sumWeights(items: { weight: number }[]): number {
  return items.reduce((sum, item) => sum + item.weight, 0);
}
