"use client";

import { useState } from "react";

import { format } from "date-fns";
import { CalendarIcon, CalendarPlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

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
    <div className="flex items-center justify-around gap-x-5 rounded-lg border bg-card p-4 min-h-26">
      <p className="text-sm basis-3/6">
        The due date of the selected units for the selected students, regardless
        of what it&apos;s currently set to, is about to be changed to what is
        set here.
      </p>
      <div className="space-y-1.5 basis-1/6">
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
      <Separator orientation="vertical" className="h-10" />
      <div className="basis-1/3 grid place-items-center">
        <Button
          size="sm"
          className="w-96 flex items-center justify-center"
          disabled={!hasValidSelection || !newDate}
          onClick={handleConfirm}
        >
          <CalendarPlusIcon className="mr-2 size-4" />
          Update deadline for {affectedCount} student
          {affectedCount !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
}
