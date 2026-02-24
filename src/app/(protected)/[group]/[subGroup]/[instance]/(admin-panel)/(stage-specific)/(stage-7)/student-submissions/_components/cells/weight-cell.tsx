"use client";

import { useEffect, useRef, useState } from "react";

import { CheckIcon, PencilIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

type WeightValue = number | "MV";

interface WeightCellProps {
  value: WeightValue;
  onChange?: (value: WeightValue) => void;
  className?: string;
}

export function WeightCell({ value, onChange, className }: WeightCellProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function openEdit() {
    setInputValue(String(value));
    setError(null);
    setEditing(true);
  }

  function commit() {
    const trimmed = inputValue.trim();
    if (trimmed.toUpperCase() === "MV") {
      onChange?.("MV");
      setEditing(false);
      return;
    }
    const num = Number(trimmed);
    if (!trimmed || isNaN(num) || num < 0) {
      setError('Enter a number or "MV"');
      return;
    }
    onChange?.(num);
    setEditing(false);
  }

  function cancel() {
    setEditing(false);
    setError(null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") cancel();
  }

  const displayValue = value === "MV" ? "MV" : String(value);

  if (editing) {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <div className="flex items-center gap-1">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            className={cn(
              "h-7 w-10 px-2 py-1 text-sm",
              error && "border-destructive focus-visible:ring-destructive",
            )}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950"
            onClick={commit}
            aria-label="Confirm weight"
          >
            <CheckIcon className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={cancel}
            aria-label="Cancel editing"
          >
            <XIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={openEdit}
            className={cn(
              "group flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5",
              "text-sm transition-colors hover:bg-accent",
              className,
            )}
            aria-label={`Weight: ${displayValue}. Click to edit.`}
          >
            <span
              className={cn(
                "font-medium tabular-nums",
                value === "MV" && "italic text-muted-foreground",
              )}
            >
              {displayValue}
            </span>
            <PencilIcon className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">Edit weight</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
