"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

interface SubmittedCellProps {
  submitted: boolean;
  onChange?: (submitted: boolean) => void;
  className?: string;
}

export function SubmittedCell({
  submitted,
  onChange,
  className,
}: SubmittedCellProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center", className)}>
            <Checkbox
              checked={submitted}
              onCheckedChange={(checked) => onChange?.(checked === true)}
              aria-label={
                submitted ? "Mark as not submitted" : "Mark as submitted"
              }
              className="h-5 w-5 cursor-pointer data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          {submitted ? "Mark as not submitted" : "Mark as submitted"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
