"use client";

import { useState } from "react";

import { Check, ChevronsUpDown } from "lucide-react";

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
import { fuzzyMatch } from "@/lib/utils/general/fuzzy-match";

import { type ManualReadingAllocationReader } from "./manual-allocation-types";

interface ReaderComboboxProps {
  readers: ManualReadingAllocationReader[];
  value?: string;
  onValueChange: (value: string | null) => void;
  className?: string;
  excludeReaderId?: string; // To exclude project supervisor from options
}

export function ReaderCombobox({
  readers,
  value,
  onValueChange,
  className,
  excludeReaderId,
}: ReaderComboboxProps) {
  const [open, setOpen] = useState(false);

  const availableReaders = readers.filter(reader => reader.id !== excludeReaderId);
  
  const selectedReader = availableReaders.find(
    (reader) => reader.id === value,
  );

  const filterReaders = (
    searchTerm: string,
    reader: ManualReadingAllocationReader,
  ) => {
    const search = searchTerm.toLowerCase();

    const nameMatch = fuzzyMatch(search, reader.name);
    if (nameMatch) return true;

    return fuzzyMatch(search, reader.id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-auto min-h-[40px] w-[320px] justify-between p-3",
            className,
          )}
        >
          {selectedReader ? (
            <ReaderCell reader={selectedReader} selected />
          ) : (
            <span className="text-muted-foreground">Select reader...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0">
        <Command
          filter={(value, search) => {
            const reader = availableReaders.find((r) => r.id === value);
            return reader && filterReaders(search, reader) ? 1 : 0;
          }}
        >
          <CommandInput placeholder="Search readers..." className="h-9" />
          <CommandList>
            <CommandEmpty>No reader found.</CommandEmpty>
            <CommandGroup>
              {availableReaders.map((reader) => (
                <CommandItem
                  key={reader.id}
                  value={reader.id}
                  onSelect={(currentValue) => {
                    const newValue = currentValue === value ? null : currentValue;
                    onValueChange(newValue);
                    setOpen(false);
                  }}
                  className="p-3"
                >
                  <div className="flex w-full items-center justify-between">
                    <ReaderCell reader={reader} />
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4 shrink-0",
                        value === reader.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function ReaderCell({
  reader,
  selected = false,
}: {
  reader: ManualReadingAllocationReader;
  selected?: boolean;
}) {
  const getReaderStatusColor = (reader: ManualReadingAllocationReader) => {
    const total = reader.currentAllocations + reader.pendingAllocations;
    if (total > reader.readingWorkloadQuota) return "text-red-600";
    if (total === reader.readingWorkloadQuota) return "text-orange-600";
    return "text-gray-500";
  };
  
  const formatReaderDetails = (reader: ManualReadingAllocationReader) => {
    const total = reader.currentAllocations + reader.pendingAllocations;
    return `(${total}/${reader.readingWorkloadQuota} projects)`;
  };

  if (selected) {
    return (
      <div className="flex w-full min-w-0 flex-col items-start">
        <span className="truncate pr-2 text-sm font-medium">
          {reader.name}
        </span>
        <span
          className={cn("mt-1 text-xs", getReaderStatusColor(reader))}
        >
          {formatReaderDetails(reader)}
        </span>
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1">
      <div className="truncate font-medium">{reader.name}</div>
      <div className="text-sm text-gray-500">{reader.id}</div>
      <div className={cn("text-xs", getReaderStatusColor(reader))}>
        {formatReaderDetails(reader)}
      </div>
    </div>
  );
}