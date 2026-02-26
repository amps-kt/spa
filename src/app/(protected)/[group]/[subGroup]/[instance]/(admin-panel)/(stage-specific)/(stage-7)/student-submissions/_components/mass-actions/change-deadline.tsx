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

import { type SelectionMode, useSubmissions } from "../submissions-context";

export function ChangeDeadlineAction() {
  const { batchUpdateUnits, visibleStudents } = useSubmissions();

  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectionMode] = useState<SelectionMode>("include");
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const confirmDisabled =
    selectedUnitIds.length === 0 ||
    !newDate ||
    (selectionMode === "include" && selectedStudentIds.length === 0);

  function handleConfirm() {
    if (!newDate) return;
    batchUpdateUnits(selectedUnitIds, selectedStudentIds, selectionMode, {
      customDueDate: newDate,
    });
    // reset form after applying
    setSelectedUnitIds([]);
    setSelectedStudentIds([]);
    setNewDate(undefined);
  }

  const affectedCount =
    selectionMode === "exclude"
      ? visibleStudents.length - selectedStudentIds.length
      : selectedStudentIds.length;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4 flex justify-around items-center gap-x-5">
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
        disabled={confirmDisabled}
        onClick={handleConfirm}
      >
        Update deadline for {affectedCount} student
        {affectedCount !== 1 ? "s" : ""}
      </Button>
    </div>
  );
}
