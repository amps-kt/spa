import { Checkbox } from "@/components/ui/checkbox";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { cn } from "@/lib/utils";

export function SubmittedCell({
  submitted,
  onChange,
  className,
}: {
  submitted: boolean;
  onChange: (submitted: boolean) => void;
  className?: string;
}) {
  return (
    <WithTooltip
      tip={submitted ? "Mark as not submitted" : "Mark as submitted"}
      align="center"
    >
      <div className={cn("flex items-center justify-center", className)}>
        <Checkbox
          checked={submitted}
          onCheckedChange={(checked) => onChange(checked === true)}
          aria-label={submitted ? "Mark as not submitted" : "Mark as submitted"}
          className="h-5 w-5 cursor-pointer"
        />
      </div>
    </WithTooltip>
  );
}
