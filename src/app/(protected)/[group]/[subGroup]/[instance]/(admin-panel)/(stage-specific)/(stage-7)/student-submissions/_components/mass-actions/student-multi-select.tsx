import { useState } from "react";

import { type ClassValue } from "clsx";
import { CheckIcon } from "lucide-react";

import { type StudentDTO } from "@/dto";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { StudentBadge } from "@/components/ui/data-table/cells/student-cell";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";

import { useSubmissions, type SelectionMode } from "../submissions-context";

export function StudentMultiSelect({
  selectedStudentIds,
  onSelectedStudentIdsChange,
  selectionMode,
  onSelectionModeChange,
  className,
}: {
  selectedStudentIds: string[];
  onSelectedStudentIdsChange: (ids: string[]) => void;
  selectionMode: SelectionMode;
  onSelectionModeChange: (mode: SelectionMode) => void;
  className?: ClassValue;
}) {
  const { visibleStudents } = useSubmissions();

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Students</label>
        <div className="inline-flex items-center gap-1 rounded-md bg-muted p-0.5">
          <button
            onClick={() => {
              onSelectionModeChange("exclude");
              onSelectedStudentIdsChange([]);
            }}
            className={cn(
              "rounded px-2 py-1 text-xs font-medium transition-colors",
              selectionMode === "exclude"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Exclude
          </button>
          <button
            onClick={() => {
              onSelectionModeChange("include");
              onSelectedStudentIdsChange([]);
            }}
            className={cn(
              "rounded px-2 py-1 text-xs font-medium transition-colors",
              selectionMode === "include"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Include
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {selectionMode === "exclude"
          ? "Changes apply to all visible students except those listed below."
          : "Changes apply only to the students listed below."}
      </p>

      <StudentCombobox
        students={visibleStudents}
        selected={selectedStudentIds}
        onChange={onSelectedStudentIdsChange}
        mode={selectionMode}
      />

      {selectedStudentIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {/* todo: selected students should sync with the selection column on the data table */}
          {selectedStudentIds.map((id) => {
            const student = visibleStudents.find((s) => s.id === id);
            if (!student) return null;
            // todo: should be able to X these to remove the student from the selection
            return <StudentBadge key={student.id} student={student} />;
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
  mode: SelectionMode;
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
    mode === "exclude"
      ? "Search students to exclude..."
      : "Search students to include...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-full justify-start text-sm font-normal"
        >
          {selected.length === 0 ? (
            <span className="text-muted-foreground">
              {mode === "exclude"
                ? "No students excluded"
                : "No students selected"}
            </span>
          ) : (
            <span>
              {selected.length} student{selected.length !== 1 && "s"}{" "}
              {mode === "exclude" ? "excluded" : "selected"}
            </span>
          )}
        </Button>
      </PopoverTrigger>
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
