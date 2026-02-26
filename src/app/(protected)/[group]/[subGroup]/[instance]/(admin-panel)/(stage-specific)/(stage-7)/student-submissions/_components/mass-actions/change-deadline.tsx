"use client";

import { useState } from "react";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";

import { useSubmissions } from "../submissions-context";

export function ChangeDeadlineAction() {
  const {
    batchUpdateUnits,
    visibleStudents,
    selectedStudentIds,
    selectionMode,
    hasValidSelection,
  } = useSubmissions();

  const [newDate, setNewDate] = useState<Date | undefined>();
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const affectedCount =
    selectionMode === "exclude"
      ? visibleStudents.length - selectedStudentIds.length
      : selectedStudentIds.length;

  function handleConfirm() {
    if (!newDate) return;
    batchUpdateUnits({ customDueDate: newDate });
    setNewDate(undefined);
  }

  return (
    <div className="flex items-center justify-around gap-x-5 rounded-lg border bg-card p-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">New Due Date</label>
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 w-full justify-start text-sm font-normal",
                !newDate && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {newDate ? format(newDate, "dd/MM/yyyy") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={newDate}
              onSelect={(date) => {
                setNewDate(date ?? undefined);
                setDatePickerOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <Button
        size="sm"
        className="w-96"
        disabled={!hasValidSelection || !newDate}
        onClick={handleConfirm}
      >
        Update deadline for {affectedCount} student
        {affectedCount !== 1 ? "s" : ""}
      </Button>
    </div>
  );
}
