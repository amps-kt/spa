import { useState } from "react";

import { format, set } from "date-fns";
import { CalendarIcon, Clock2Icon, PencilIcon, SaveIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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
import { updateDateOnly } from "@/lib/utils/date/update-date-only";

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

  function handleDayChange(date: Date | undefined) {
    if (!date) return;
    setSelected(updateDateOnly(selected, date));
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const [hours, minutes] = e.target.value.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;
    setSelected(set(selected, { hours, minutes }));
  }

  function handleSave() {
    onChange(selected);
    setOpen(false);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) setSelected(value);
        setOpen(next);
      }}
    >
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
                aria-label={`Due date: ${format(value, "dd/MM/yyyy HH:mm")}. Click to change.`}
              >
                <span className="tabular-nums">
                  {format(value, "dd/MM/yyyy HH:mm")}
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
          onSelect={handleDayChange}
          initialFocus
        />

        <div className="border-t px-3 py-3">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="due-time">Time</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="due-time"
                  type="time"
                  value={format(selected, "HH:mm")}
                  onChange={handleTimeChange}
                  className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
                <InputGroupAddon>
                  <Clock2Icon className="text-muted-foreground" />
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </FieldGroup>
        </div>

        <div className="border-t px-3 py-2">
          <Button size="sm" className="w-full" onClick={handleSave}>
            <SaveIcon className="size-4 mr-2" />
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
