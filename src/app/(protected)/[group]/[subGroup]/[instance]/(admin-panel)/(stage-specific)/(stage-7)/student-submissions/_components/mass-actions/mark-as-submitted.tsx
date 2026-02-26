"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { type SelectionMode, useSubmissions } from "../submissions-context";

export function MarkAsSubmittedAction() {
  const { batchUpdateUnits, visibleStudents } = useSubmissions();

  const [submitting, setSubmitting] = useState(true);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectionMode] = useState<SelectionMode>("exclude");

  const confirmDisabled =
    selectedUnitIds.length === 0 ||
    (selectionMode === "include" && selectedStudentIds.length === 0);

  function handleConfirm() {
    batchUpdateUnits(selectedUnitIds, selectedStudentIds, selectionMode, {
      submitted: true,
    });
    // reset form after applying
    setSelectedUnitIds([]);
    setSelectedStudentIds([]);
  }

  const affectedCount =
    selectionMode === "exclude"
      ? visibleStudents.length - selectedStudentIds.length
      : selectedStudentIds.length;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4 flex justify-around items-center gap-x-5">
      <div className="space-y-1.5">
        <div className="flex items-center gap-3 border rounded-md p-2">
          <Label
            htmlFor="toggle1"
            className="text-sm font-medium text-foreground"
          >
            {submitting ? "Submitted" : "Not Submitted"}
          </Label>
          <Switch
            id="toggle1"
            checked={submitting}
            onCheckedChange={(checked) => setSubmitting(!checked)}
          />
        </div>
      </div>
      <Button
        size="sm"
        className="w-96"
        disabled={confirmDisabled}
        onClick={handleConfirm}
      >
        Mark {affectedCount} student{affectedCount !== 1 ? "s" : ""} as
        submitted
      </Button>
    </div>
  );
}
