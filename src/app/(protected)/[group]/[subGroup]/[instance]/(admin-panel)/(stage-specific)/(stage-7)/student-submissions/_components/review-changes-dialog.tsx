import { useMemo, useState } from "react";

import { format } from "date-fns";
import {
  CalendarIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  SaveIcon,
  UserIcon,
  WeightIcon,
} from "lucide-react";
import { toast } from "sonner";

import { type StudentDTO, type UnitOfAssessmentDTO } from "@/dto";

import { useInstanceParams } from "@/components/params-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { api } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

import {
  computeChangeCount,
  computeUnitChangeCount,
  type StudentDelta,
  type UnitDelta,
  useSubmissions,
} from "./submissions-context";

function ChangeSummary() {
  const { studentDeltasByFlag, activeFlag } = useSubmissions();

  const activeStudents = studentDeltasByFlag[activeFlag];

  const units = activeStudents.flatMap((s) => s.units);

  const items = [
    {
      count: activeStudents.filter((x) => x.enrolled !== undefined).length,
      label: "enrolment",
      icon: UserIcon,
    },
    {
      count: units.filter((u) => u.submitted !== undefined).length,
      label: "submission",
      icon: CheckCircle2Icon,
    },
    {
      count: units.filter((u) => u.customDueDate !== undefined).length,
      label: "deadline",
      icon: CalendarIcon,
    },
    {
      count: units.filter((u) => u.customWeight !== undefined).length,
      label: "MV",
      icon: WeightIcon,
    },
  ].filter((item) => item.count > 0);

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Badge
            key={item.label}
            variant="secondary"
            className="gap-1.5 px-2.5 py-1 text-xs"
          >
            <Icon className="h-3 w-3" />
            {item.count} {item.label} change{item.count !== 1 ? "s" : ""}
          </Badge>
        );
      })}
    </div>
  );
}

function StudentChangeRow({
  delta,
  studentMap,
  uoaMap,
}: {
  delta: StudentDelta;
  studentMap: Record<string, StudentDTO>;
  uoaMap: Record<string, UnitOfAssessmentDTO>;
}) {
  const [open, setOpen] = useState(false);

  const student = studentMap[delta.studentId];

  const changeCount = computeChangeCount(delta);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate max-w-64">
              {student.name}
            </span>
            <span className="text-xs text-muted-foreground">{student.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {changeCount} change{changeCount !== 1 ? "s" : ""}
            </Badge>
            <ChevronDownIcon
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
            />
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-1 px-3 pb-2 pt-1">
          {delta.enrolled !== undefined && (
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <UserIcon className="h-3 w-3" />
                {delta.enrolled ? "Will be re-enrolled" : "Will be un-enrolled"}
              </span>
            </p>
          )}
          {delta.units
            .filter((u) => computeUnitChangeCount(u) > 0)
            .map((uc) => (
              <UnitChangeDetail key={uc.unitId} uoaMap={uoaMap} delta={uc} />
            ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function UnitChangeDetail({
  delta,
  uoaMap,
}: {
  delta: UnitDelta;
  uoaMap: Record<string, UnitOfAssessmentDTO>;
}) {
  return (
    <div className="text-xs text-muted-foreground">
      <p>{uoaMap[delta.unitId].title}</p>
      <ul className="list-disc ml-4">
        {delta.submitted !== undefined && (
          <li>
            marked as{" "}
            <span className="font-semibold font-mono">
              {delta.submitted ? "submitted" : "not submitted"}
            </span>
          </li>
        )}
        {delta.customDueDate !== undefined && (
          <li>
            deadline changed to{" "}
            <span className="font-semibold font-mono">
              {format(delta.customDueDate, "dd/MM/yyyy")}
            </span>
          </li>
        )}

        {delta.customWeight !== undefined && (
          <li>
            <span className="font-semibold font-mono">
              {delta.customWeight === 0 ? "MV applied" : "MV removed"}
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}

// ----------------------------------------------------------- main dialog

export function ReviewChangesDialog({
  open,
  onOpenChange,
  studentMap,
  uoaMap,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentMap: Record<string, StudentDTO>;
  uoaMap: Record<string, UnitOfAssessmentDTO>;
}) {
  const params = useInstanceParams();
  const { studentDeltasByFlag, activeFlag, resetFlag } = useSubmissions();

  const {
    mutateAsync: api_updateStudentSubmissionInfo,
    isPending: isCommitting,
  } = api.teachingOffice.updateStudentSubmissionInfo.useMutation();

  const activeStudents = useMemo(
    () =>
      studentDeltasByFlag[activeFlag].filter((s) => computeChangeCount(s) > 0),
    [studentDeltasByFlag, activeFlag],
  );

  const totalChanges = activeStudents
    .map(computeChangeCount)
    .reduce((a, b) => a + b, 0);

  const utils = api.useUtils();

  async function handleCommit() {
    onOpenChange(false);
    void toast
      .promise(
        api_updateStudentSubmissionInfo({
          params,
          studentDeltas: activeStudents,
        }),
        {
          loading: "Updating student details",
          success: "Successfully updated details",
          error: "Something went wrong",
        },
      )
      .unwrap()
      .then(() =>
        utils.teachingOffice.getFlagStudentSubmissionInfo.invalidate({
          params,
          flagId: activeFlag,
        }),
      )
      .then(() => {
        resetFlag(activeFlag);
      });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review Changes</DialogTitle>
          <DialogDescription>
            You are about to save {totalChanges} change
            {totalChanges !== 1 ? "s" : ""} across {activeStudents.length}{" "}
            student
            {activeStudents.length !== 1 ? "s" : ""}. Please review before
            committing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <ChangeSummary />
          <Separator />
          <div className="max-h-[40vh] overflow-y-auto">
            <div className="space-y-1">
              {activeStudents.map((s) => (
                <StudentChangeRow
                  key={s.studentId}
                  studentMap={studentMap}
                  uoaMap={uoaMap}
                  delta={s}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="grid grid-cols-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCommitting}
          >
            Back to editing
          </Button>
          <Button onClick={handleCommit} disabled={isCommitting}>
            <SaveIcon className="mr-2 h-3.5 w-3.5" />
            {isCommitting ? "Saving..." : "Commit Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
