"use client";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { useSubmissions } from "./submissions-context";

export function FlagTabFilter({ className }: { className?: string }) {
  const { availableFlags, activeFlag, setActiveFlag } = useSubmissions();

  if (availableFlags.length <= 1) return null;

  return (
    <div className={cn("flex items-center gap-4", className)} role="tablist">
      {availableFlags.map((flag) => (
        <Button
          key={flag.id}
          variant={activeFlag === flag.id ? "secondary" : "outline"}
          onClick={() => setActiveFlag(flag.id)}
          className="cursor-pointer"
        >
          {flag.displayName}{" "}
        </Button>
      ))}
    </div>
  );
}
