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

import { cn } from "@/lib/utils";
import { keyBy } from "@/lib/utils/key-by";

import {
  useSubmissions,
  type PendingChanges,
  type PendingUnitChange,
} from "./submissions-context";

type PendingUnitChangeDisplay = PendingUnitChange & { unitTitle: string };

interface ChangesGroupedByStudent {
  studentId: string;
  studentName: string;
  enrolmentChange?: boolean; // ???? this is whether the enrolled status changed right?, not what it has changed to
  unitChanges: PendingUnitChangeDisplay[];
}

// I think the best way to present the changes is to group them by student (probably)
// alternatively I could group them by the kind of change ig
// so all weight changes, then all due date changes, etc.
function groupChangesByStudent(
  changes: PendingChanges,
  findStudentName: (id: string) => string,
  findUnitTitle: (id: string) => string,
): ChangesGroupedByStudent[] {
  const record = changes.students.reduce(
    (acc, s) => ({
      ...acc,
      [s.studentId]: {
        studentId: s.studentId,
        studentName: findStudentName(s.studentId),
        enrolmentChange: s.enrolled,
        unitChanges: [],
      },
    }),
    {} as Record<string, ChangesGroupedByStudent>,
  );

  for (const u of changes.units) {
    record[u.studentId] ??= {
      studentId: u.studentId,
      studentName: findStudentName(u.studentId),
      unitChanges: [],
    };
    record[u.studentId].unitChanges.push({
      ...u,
      unitTitle: findUnitTitle(u.unitId),
    });
  }

  return Object.values(record);
}

function ChangeSummary({ changes }: { changes: PendingChanges }) {
  const items = [
    { count: changes.students.length, label: "enrolment", icon: UserIcon },
    {
      count: changes.units.filter((u) => u.submitted !== undefined).length,
      label: "submission",
      icon: CheckCircle2Icon,
    },
    {
      count: changes.units.filter((u) => u.customDueDate !== undefined).length,
      label: "deadline",
      icon: CalendarIcon,
    },
    {
      count: changes.units.filter((u) => u.customWeight !== undefined).length,
      label: "weight",
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

function StudentChangeRow({ group }: { group: ChangesGroupedByStudent }) {
  const [open, setOpen] = useState(false);

  const changeCount =
    (group.enrolmentChange !== undefined ? 1 : 0) +
    group.unitChanges.reduce((sum, u) => {
      let fields = 0;
      if (u.submitted !== undefined) fields++;
      if (u.customDueDate !== undefined) fields++;
      if (u.customWeight !== undefined) fields++;
      return sum + fields;
    }, 0);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted">
          <div className="flex items-center gap-2">
            <span className="font-medium">{group.studentName}</span>
            <span className="text-xs text-muted-foreground">
              {group.studentId}
            </span>
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
          {group.enrolmentChange !== undefined && (
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <UserIcon className="h-3 w-3" />
                {group.enrolmentChange
                  ? "Will be re-enrolled"
                  : "Will be un-enrolled"}
              </span>
            </p>
          )}
          {group.unitChanges.map((uc) => (
            <UnitChangeDetail key={uc.unitId} change={uc} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function UnitChangeDetail({ change }: { change: PendingUnitChangeDisplay }) {
  return (
    <div className="text-xs text-muted-foreground">
      <p>{change.unitTitle}</p>
      <ul className="list-disc ml-4">
        {change.submitted !== undefined && (
          <li>
            marked as{" "}
            <span className="font-semibold font-mono">
              {change.submitted ? "submitted" : "not submitted"}
            </span>
          </li>
        )}
        {change.customDueDate !== undefined && (
          <li>
            deadline changed to{" "}
            <span className="font-semibold font-mono">
              {format(change.customDueDate, "dd/MM/yyyy")}
            </span>
          </li>
        )}

        {change.customWeight !== undefined && (
          <li>
            weight changed to{" "}
            <span className="font-semibold font-mono">
              {change.customWeight === "MV"
                ? "MV"
                : String(change.customWeight)}
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}

// ----------------------------------------------------------- main dialog

interface ReviewChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewChangesDialog({
  open,
  onOpenChange,
}: ReviewChangesDialogProps) {
  const { getPendingChangesForFlag, activeFlag, rows, commitFlag } =
    useSubmissions();
  const [isCommitting, setIsCommitting] = useState(false);

  const changes = useMemo(
    () => getPendingChangesForFlag(activeFlag),
    [getPendingChangesForFlag, activeFlag],
  );

  const findStudentName = useMemo(() => {
    const nameMap = keyBy(rows, (r) => r.student.id);
    return (id: string) => nameMap[id].student.name;
  }, [rows]);

  const findUnitTitle = useMemo(() => {
    const titleMap = keyBy(
      rows.flatMap((r) => r.units),
      (u) => u.unit.id,
      (u) => u.unit.title,
    );
    return (id: string) => titleMap[id] ?? id;
  }, [rows]);

  const grouped = useMemo(
    () => groupChangesByStudent(changes, findStudentName, findUnitTitle),
    [changes, findStudentName, findUnitTitle],
  );

  const totalChanges = changes.students.length + changes.units.length;

  async function handleCommit() {
    setIsCommitting(true);
    onOpenChange(false);
    // TODO: wire up tRPC mutations here
    setIsCommitting(false);
    // TODO: this should only trigger after the tRPC mutation
    // commitFlag(activeFlag);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review Changes</DialogTitle>
          <DialogDescription>
            You are about to save {totalChanges} change
            {totalChanges !== 1 ? "s" : ""} across {grouped.length} student
            {grouped.length !== 1 ? "s" : ""}. Please review before committing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <ChangeSummary changes={changes} />
          <Separator />
          <div className="max-h-[40vh] overflow-y-auto">
            <div className="space-y-1">
              {grouped.map((group) => (
                <StudentChangeRow key={group.studentId} group={group} />
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
