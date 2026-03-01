import { useState } from "react";

import { type ClassValue } from "clsx";
import { CheckIcon, RotateCcwIcon } from "lucide-react";

import { type StudentDTO } from "@/dto";

import { StudentBadge } from "@/components/ui/badges/student-badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";

import { cn } from "@/lib/utils";

import { StudentSelectionMode } from "../student-unit-selection";
import { useSubmissions } from "../submissions-context";

export function StudentMultiSelect({
  studentMap,
  className,
}: {
  studentMap: Record<string, StudentDTO>;
  className?: ClassValue;
}) {
  const {
    studentSubmissionsByFlag,
    activeFlag,
    selection: {
      setStudentIds,
      setMode,
      state: { studentIds: selectedStudentIds, mode: selectedMode },
    },
  } = useSubmissions();

  const visibleStudents = studentSubmissionsByFlag[activeFlag].map(
    (f) => f.student,
  );

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Students</label>
        <div className="inline-flex items-center gap-1 rounded-md bg-muted p-0.5">
          <button
            onClick={() => setMode(StudentSelectionMode.EXCLUDE)}
            className={cn(
              "rounded px-2 py-1 text-xs font-medium transition-colors",
              selectedMode === StudentSelectionMode.EXCLUDE
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Exclude
          </button>
          <button
            onClick={() => setMode(StudentSelectionMode.INCLUDE)}
            className={cn(
              "rounded px-2 py-1 text-xs font-medium transition-colors",
              selectedMode === StudentSelectionMode.INCLUDE
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Include
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {selectedMode === StudentSelectionMode.EXCLUDE
          ? "Changes apply to all visible students except those listed below."
          : "Changes apply only to the students listed below."}
      </p>

      <StudentCombobox
        students={visibleStudents}
        selected={selectedStudentIds}
        onChange={setStudentIds}
        mode={selectedMode}
      />

      {selectedStudentIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedStudentIds.map((id) => {
            const student = studentMap[id];
            return (
              <StudentBadge
                key={student.id}
                student={student}
                onClick={() => {
                  setStudentIds(
                    selectedStudentIds.filter((id) => id !== student.id),
                  );
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function StudentCombobox({
  students,
  selected,
  onChange,
  mode,
}: {
  students: StudentDTO[];
  selected: string[];
  onChange: (ids: string[]) => void;
  mode: StudentSelectionMode;
}) {
  const [open, setOpen] = useState(false);
  const selectedSet = new Set(selected);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  }

  const placeholder =
    mode === StudentSelectionMode.EXCLUDE
      ? "Search students to exclude..."
      : "Search students to include...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex gap-2">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-full justify-start text-sm font-normal"
          >
            {selected.length === 0 ? (
              <span className="text-muted-foreground">
                {mode === StudentSelectionMode.EXCLUDE
                  ? "No students excluded"
                  : "No students selected"}
              </span>
            ) : (
              <span>
                {selected.length} student{selected.length !== 1 && "s"}{" "}
                {mode === StudentSelectionMode.EXCLUDE
                  ? "excluded"
                  : "selected"}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <WithTooltip tip="Reset selected students">
          <Button
            className="grid place-items-center size-9"
            variant="outline"
            onClick={() => onChange([])}
            disabled={selected.length === 0}
          >
            <RotateCcwIcon className="size-4" />
          </Button>
        </WithTooltip>
      </div>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No students found.</CommandEmpty>
            <CommandGroup>
              {students.map((student) => {
                const isSelected = selectedSet.has(student.id);
                return (
                  <CommandItem
                    key={student.id}
                    value={`${student.id} ${student.name}`}
                    onSelect={() => toggle(student.id)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <CheckIcon className="h-3 w-3 stroke-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm">{student.id}</span>
                      <span className="text-xs text-muted-foreground">
                        {student.name}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
