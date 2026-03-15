import { useState } from "react";

import { ChevronsUpDownIcon, CheckIcon } from "lucide-react";

import { GRADES } from "@/config/grades";

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

import { cn } from "@/lib/utils";

export function GradeInput({
  value,
  setValue,
}: {
  value: number | undefined;
  setValue: (newVal: number | undefined) => void;
}) {
  const dropDownDefaultVal = "??";
  const [open, setOpen] = useState(false);

  const hasGrade = value !== undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between text-muted-foreground",
            hasGrade && "text-foreground",
          )}
        >
          <span>
            {hasGrade
              ? (GRADES.find((grade) => grade.value === value)?.label ??
                dropDownDefaultVal)
              : dropDownDefaultVal}
          </span>
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[100px] p-0">
        <Command>
          <CommandInput placeholder="Search grade..." />
          <CommandList>
            <CommandEmpty>No grade found.</CommandEmpty>
            <CommandGroup>
              {GRADES.map((grade) => (
                <CommandItem
                  key={grade.value}
                  onSelect={() => {
                    setValue(grade.value);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      grade.value === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {grade.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
