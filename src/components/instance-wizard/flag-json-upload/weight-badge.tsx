import { Badge } from "@/components/ui/badge";

export function WeightBadge({
  weight,
  totalWeight,
  variant,
}: {
  weight: number;
  totalWeight: number;
  variant: "outline" | "secondary";
}) {
  const pct = totalWeight > 0 ? ((weight / totalWeight) * 100).toFixed(2) : "0";
  const pctDisplay = parseFloat(pct).toString();

  return (
    <Badge
      variant={variant}
      className="text-xs rounded-sm px-1.5 w-22 flex justify-center mr-1"
    >
      w:{weight} ({pctDisplay}%)
    </Badge>
  );
}

export function sumWeights(items: { weight: number }[]): number {
  return items.reduce((sum, item) => sum + item.weight, 0);
}
