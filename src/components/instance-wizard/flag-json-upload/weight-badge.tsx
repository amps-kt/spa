import { Badge } from "@/components/ui/badge";

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
  const pct = totalWeight > 0 ? ((weight / totalWeight) * 100).toFixed(2) : "0";
  const pctDisplay = parseFloat(pct).toString();

  return (
    <Badge
      variant={variant}
      className={cn(
        "text-xs rounded-sm px-1.5 w-22 flex justify-center",
        className,
      )}
    >
      w:{weight} ({pctDisplay}%)
    </Badge>
  );
}

export function sumWeights(items: { weight: number }[]): number {
  return items.reduce((sum, item) => sum + item.weight, 0);
}
