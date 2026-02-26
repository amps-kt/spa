"use client";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { useSubmissions } from "./submissions-context";

export function FlagTabFilter({ className }: { className?: string }) {
  const { availableFlags, activeFlag, setActiveFlag } = useSubmissions();

  if (availableFlags.length <= 1) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg bg-muted p-1",
        className,
      )}
    >
      {availableFlags.map((flag) => (
        <Button
          key={flag.id}
          size="lg"
          variant={activeFlag === flag.id ? "default" : "ghost"}
          className={cn(
            "rounded-md w-full text-lg font-medium transition-colors cursor-pointer",
            activeFlag === flag.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-primary/10",
          )}
          onClick={() => setActiveFlag(flag.id)}
        >
          {flag.displayName}
        </Button>
      ))}
    </div>
  );
}
