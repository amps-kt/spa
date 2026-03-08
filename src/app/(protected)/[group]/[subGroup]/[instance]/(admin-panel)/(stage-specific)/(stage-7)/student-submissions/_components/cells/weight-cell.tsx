"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";

export function WeightCell({
  isMV,
  onChange,
  className,
}: {
  isMV: boolean;
  onChange: (mv: boolean) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Checkbox
        id="mv-check"
        className="h-5 w-5 cursor-pointer border border-muted-foreground data-[state=checked]:border-destructive data-[state=checked]:bg-destructive data-[state=indeterminate]:bg-destructive data-[state=checked]:text-destructive-foreground data-[state=indeterminate]:text-destructive-foreground"
        checked={isMV}
        onCheckedChange={(checked) => onChange(checked === true)}
      />
      <Label htmlFor="mv-check" className="hidden">
        MV
      </Label>
    </div>
  );
}
