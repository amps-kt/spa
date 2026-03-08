"use client";

import { useState, useMemo } from "react";

import { FileDiffIcon, RotateCcwIcon } from "lucide-react";

import { type StudentDTO, type UnitOfAssessmentDTO } from "@/dto";

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
import { computeChangeCount, useSubmissions } from "./submissions-context";

export function PendingChangesBar({
  studentMap,
  uoaMap,
}: {
  studentMap: Record<string, StudentDTO>;
  uoaMap: Record<string, UnitOfAssessmentDTO>;
}) {
  const { isDirty, studentDeltasByFlag, activeFlag, resetFlag } =
    useSubmissions();
  const [reviewOpen, setReviewOpen] = useState(false);

  const pendingChanges = useMemo(
    () => studentDeltasByFlag[activeFlag],
    [studentDeltasByFlag, activeFlag],
  );

  const totalChanges = useMemo(
    () => pendingChanges.map(computeChangeCount).reduce((a, b) => a + b, 0),
    [pendingChanges],
  );

  if (!isDirty) return null;

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

      <ReviewChangesDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        studentMap={studentMap}
        uoaMap={uoaMap}
      />
    </>
  );
}
