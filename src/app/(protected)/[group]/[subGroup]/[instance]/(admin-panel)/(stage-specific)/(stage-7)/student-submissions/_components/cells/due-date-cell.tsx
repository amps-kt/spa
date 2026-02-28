import { useState } from "react";

import { format } from "date-fns";
import { CalendarIcon, PencilIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

export function DueDateCell({
  value,
  onChange,
  className,
}: {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date>(value);

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    setSelected(date);
    onChange(date);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5",
                  "text-sm transition-colors hover:bg-accent",
                  className,
                )}
                aria-label={`Due date: ${format(selected, "dd/MM/yyyy")}. Click to change.`}
              >
                <span className="tabular-nums">
                  {format(selected, "dd/MM/yyyy")}
                </span>
                <PencilIcon className="h-3 w-3 text-muted-foreground" />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">Change due date</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>Change due date</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={() => {
              setSelected(value);
              setOpen(false);
            }}
          >
            Reset
          </Button>
        </div>
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
