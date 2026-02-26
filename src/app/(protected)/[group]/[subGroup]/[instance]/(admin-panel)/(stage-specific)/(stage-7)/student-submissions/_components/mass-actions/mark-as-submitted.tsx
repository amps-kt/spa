"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { useSubmissions } from "../submissions-context";

export function MarkAsSubmittedAction() {
  const {
    batchUpdateUnits,
    visibleStudents,
    selectedStudentIds,
    selectionMode,
    hasValidSelection,
  } = useSubmissions();

  const [markAsSubmitted, setMarkAsSubmitted] = useState(true);

  const affectedCount =
    selectionMode === "exclude"
      ? visibleStudents.length - selectedStudentIds.length
      : selectedStudentIds.length;

  function handleConfirm() {
    batchUpdateUnits({ submitted: markAsSubmitted });
  }

  return (
    <div className="flex items-center justify-around gap-x-5 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-3 rounded-md border p-2">
        <Label htmlFor="submitted-toggle" className="text-sm font-medium">
          {markAsSubmitted ? "Submitted" : "Not Submitted"}
        </Label>
        <Switch
          id="submitted-toggle"
          checked={markAsSubmitted}
          onCheckedChange={(checked) => setMarkAsSubmitted(Boolean(checked))}
        />
      </div>
      <Button
        size="sm"
        className="w-96"
        disabled={!hasValidSelection}
        onClick={handleConfirm}
      >
        Mark {affectedCount} student{affectedCount !== 1 ? "s" : ""} as{" "}
        {markAsSubmitted ? "submitted" : "not submitted"}
      </Button>
    </div>
  );
}
