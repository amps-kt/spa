"use client";

import { AlertTriangleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";
import { YesNoAlertDialog } from "@/components/yes-no-alert-dialog";

import { cn } from "@/lib/utils";

interface EnrolledCellProps {
  enrolled: boolean;
  studentName?: string;
  onChange?: (enrolled: boolean) => void;
  className?: string;
}

export function EnrolledCell({
  enrolled,
  studentName,
  onChange,
  className,
}: EnrolledCellProps) {
  const isUnenrolling = enrolled;

  return (
    <YesNoAlertDialog
      action={() => onChange?.(!enrolled)}
      title={
        <span className="flex items-center gap-2">
          {isUnenrolling && (
            <AlertTriangleIcon className="h-5 w-5 text-destructive" />
          )}
          {isUnenrolling ? "Un-enrol student?" : "Re-enrol student?"}
        </span>
      }
      description={
        isUnenrolling ? (
          <>
            You are about to{" "}
            <strong className="text-destructive">un-enrol</strong>
            {studentName ? (
              <>
                {" "}
                <strong>{studentName}</strong>
              </>
            ) : (
              " this student"
            )}{" "}
            from the course. This means none of their units of assessment will
            be shown to any marker. Are you sure you want to continue?
          </>
        ) : (
          <>
            You are about to re-enrol
            {studentName ? (
              <>
                {" "}
                <strong>{studentName}</strong>
              </>
            ) : (
              " this student"
            )}{" "}
            in the course. They will regain access to all associated resources.
          </>
        )
      }
      confirmLabel={isUnenrolling ? "Yes, un-enrol" : "Yes, re-enrol"}
      cancelLabel="Cancel"
      confirmVariant={isUnenrolling ? "destructive" : "default"}
      trigger={
        <WithTooltip
          tip={isUnenrolling ? "Un-enrol student" : "Re-enrol student"}
          duration={150}
        >
          <Button
            variant={enrolled ? "outline" : "destructive"}
            size="sm"
            className={cn(
              "h-7 min-w-[4.5rem] text-xs font-semibold transition-all",
              enrolled
                ? "border-emerald-500/40 text-emerald-700 hover:border-emerald-500 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
                : "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground dark:bg-destructive/20",
              className,
            )}
            aria-label={
              enrolled
                ? `${studentName ?? "Student"} is enrolled. Click to un-enrol.`
                : `${studentName ?? "Student"} is not enrolled. Click to re-enrol.`
            }
          >
            {enrolled ? "Enrolled" : "Not enrolled"}
          </Button>
        </WithTooltip>
      }
    />
  );
}
