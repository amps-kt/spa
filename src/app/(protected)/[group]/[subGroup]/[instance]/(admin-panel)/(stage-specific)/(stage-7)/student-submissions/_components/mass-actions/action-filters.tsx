import { useState } from "react";

import { ListFilterPlusIcon } from "lucide-react";

import { SectionHeading } from "@/components/heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { cn } from "@/lib/utils";

import { type SelectionMode, useSubmissions } from "../submissions-context";

import { StudentMultiSelect } from "./student-multi-select";
import { UnitMultiSelect } from "./unit-multi-select";

function InternalActionFilters({
  selectedUnitIds,
  onSelectedUnitIdsChange,
  selectedStudentIds,
  onSelectedStudentIdsChange,
  selectionMode,
  onSelectionModeChange,
}: {
  selectedUnitIds: string[];
  onSelectedUnitIdsChange: (ids: string[]) => void;
  selectedStudentIds: string[];
  onSelectedStudentIdsChange: (ids: string[]) => void;
  selectionMode: SelectionMode;
  onSelectionModeChange: (mode: SelectionMode) => void;
}) {
  const { visibleUnits } = useSubmissions();

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 space-y-4 flex justify-around items-center gap-x-5",
      )}
    >
      <UnitMultiSelect
        units={visibleUnits}
        selected={selectedUnitIds}
        onChange={onSelectedUnitIdsChange}
      />
      <StudentMultiSelect
        className="max-w-1/2"
        selectedStudentIds={selectedStudentIds}
        onSelectedStudentIdsChange={onSelectedStudentIdsChange}
        selectionMode={selectionMode}
        onSelectionModeChange={onSelectionModeChange}
      />
    </div>
  );
}

export function ActionFilters() {
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("include");

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="filters-menu">
        <AccordionTrigger>
          <SectionHeading
            icon={ListFilterPlusIcon}
            iconClassName="text-muted-foreground"
          >
            Filters
          </SectionHeading>
        </AccordionTrigger>
        <AccordionContent>
          <InternalActionFilters
            selectedUnitIds={selectedUnitIds}
            onSelectedUnitIdsChange={setSelectedUnitIds}
            selectedStudentIds={selectedStudentIds}
            onSelectedStudentIdsChange={setSelectedStudentIds}
            selectionMode={selectionMode}
            onSelectionModeChange={setSelectionMode}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
