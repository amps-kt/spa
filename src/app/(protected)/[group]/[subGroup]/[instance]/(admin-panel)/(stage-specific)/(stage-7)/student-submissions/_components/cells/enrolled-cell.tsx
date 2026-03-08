import { useState } from "react";

import { type StudentDTO } from "@/dto";

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

// Couldn't get the `AlertDialog` or `YesNoContainer` to play nice with the `WithTooltip` components no matter how much I tried
// it was easier to just manually put this together, after all that's kinda the point of owning the components
export function EnrolledCell({
  student,
  onChange,
  className,
}: {
  student: StudentDTO;
  onChange: (enrolled: boolean) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  function handleConfirm() {
    onChange(!student.enrolled);
    setOpen(false);
  }

  const isCurrentlyEnrolled = student.enrolled;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button
                variant={"ghost"}
                size="sm"
                className={cn(
                  "h-7 min-w-[4.5rem] text-xs font-semibold transition-all cursor-pointer",
                  isCurrentlyEnrolled
                    ? "border-none bg-emerald-500/25 text-emerald-700  hover:bg-emerald-700 hover:text-white"
                    : "bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground",
                  className,
                )}
              >
                {isCurrentlyEnrolled ? "Enrolled" : "Not enrolled"}
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">
            {isCurrentlyEnrolled ? "Un-enrol student" : "Re-enrol student"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isCurrentlyEnrolled ? "Un-enrol student?" : "Re-enrol student?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {/* open to suggestions on the exact phrasing to use here */}
            {isCurrentlyEnrolled ? (
              <>
                You are about to{" "}
                <strong className="text-destructive">un-enrol</strong>{" "}
                <strong>{student.name}</strong>
                from the course. This means none of their units of assessment
                will be shown to any marker. Are you sure you want to continue?
              </>
            ) : (
              <>
                You are about to re-enrol <strong>{student.name}</strong> in the
                course. This means their submissions will now be shown to their
                relevant markers.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={
              isCurrentlyEnrolled
                ? "bg-destructive text-white hover:bg-destructive/90"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }
          >
            {isCurrentlyEnrolled ? "Yes, un-enrol" : "Yes, re-enrol"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
