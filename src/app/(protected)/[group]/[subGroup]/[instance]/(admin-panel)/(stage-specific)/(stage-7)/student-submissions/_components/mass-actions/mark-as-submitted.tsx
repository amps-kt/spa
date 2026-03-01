"use client";

import { useState } from "react";

import { FileCheckIcon, FileXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import { StudentSelectionMode } from "../student-unit-selection";
import { useSubmissions } from "../submissions-context";

export function MarkAsSubmittedAction() {
  const {
    batchUpdateUnits,

    studentSubmissionsByFlag,
    activeFlag,
    selection: {
      state: { mode: selectionMode, studentIds: selectedStudentIds },
      isValid: hasValidSelection,
    },
  } = useSubmissions();
  const visibleStudents = studentSubmissionsByFlag[activeFlag].map(
    (f) => f.student,
  );

  const [markAsSubmitted, setMarkAsSubmitted] = useState(true);

  const affectedCount =
    selectionMode === StudentSelectionMode.EXCLUDE
      ? visibleStudents.length - selectedStudentIds.length
      : selectedStudentIds.length;

  function handleConfirm() {
    batchUpdateUnits({ submitted: markAsSubmitted });
  }

  return (
    <div className="flex items-center justify-around gap-x-5 rounded-lg border bg-card p-4 min-h-26">
      <p className="text-sm basis-3/6">
        The submission status of the selected units for the selected students,
        regardless of what it&apos;s currently set to, is about to be changed to
        the value set here.
      </p>
      <div className="flex justify-between items-center gap-3 rounded-md border p-3 basis-1/6">
        <Label htmlFor="submitted-toggle" className="text-sm font-medium">
          {markAsSubmitted ? "Submitted" : "Not Submitted"}
        </Label>
        <Switch
          id="submitted-toggle"
          checked={markAsSubmitted}
          onCheckedChange={(checked) => setMarkAsSubmitted(Boolean(checked))}
        />
      </div>
      <Separator orientation="vertical" className="h-10" />
      <div className="basis-1/3 grid place-items-center">
        <Button
          size="sm"
          className="mx-auto w-96 flex justify-center items-center"
          disabled={!hasValidSelection}
          onClick={handleConfirm}
        >
          <span className="flex justify-start items-center">
            {markAsSubmitted ? (
              <FileCheckIcon className="mr-2 size-4" />
            ) : (
              <FileXIcon className="mr-2 size-4" />
            )}
            Mark {affectedCount} student{affectedCount !== 1 ? "s" : ""} as{" "}
            {markAsSubmitted ? "submitted" : "not submitted"}
          </span>
        </Button>
      </div>
    </div>
  );
}
