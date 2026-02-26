"use client";

import { useState } from "react";

import { FileDiffIcon, RotateCcwIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { ReviewChangesDialog } from "./review-changes-dialog";
import { type PendingChanges, useSubmissions } from "./submissions-context";

function countFieldChanges(changes: PendingChanges): number {
  let count = changes.students.length;

  for (const u of changes.units) {
    if (u.submitted !== undefined) count++;
    if (u.customDueDate !== undefined) count++;
    if (u.customWeight !== undefined) count++;
  }

  return count;
}

export function PendingChangesBar() {
  const { isDirty, activeFlag, getPendingChangesForFlag, resetFlag } =
    useSubmissions();
  const [reviewOpen, setReviewOpen] = useState(false);

  if (!isDirty) return null;

  const pendingChanges = getPendingChangesForFlag(activeFlag);
  const totalChanges = countFieldChanges(pendingChanges);

  return (
    <>
      <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-lg border bg-card px-4 py-3 shadow-lg">
        <p className="text-sm font-medium">
          {totalChanges} unsaved change{totalChanges !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          {/* [#9a3412] since we're gonna refactor the yes/no component anyway just gonna pin this */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <RotateCcwIcon className="h-3.5 w-3.5" />
                Discard Changes
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard all changes?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all {totalChanges} pending change
                  {totalChanges !== 1 ? "s" : ""} in the current tab back to the
                  original data before you began editing. Changes in other tabs
                  will not be affected. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => resetFlag(activeFlag)}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Yes, discard all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            size="sm"
            className="gap-2"
            onClick={() => setReviewOpen(true)}
          >
            <FileDiffIcon className="h-3.5 w-3.5" />
            Review & Save
          </Button>
        </div>
      </div>

      <ReviewChangesDialog open={reviewOpen} onOpenChange={setReviewOpen} />
    </>
  );
}
