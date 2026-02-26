"use client";

import { ListFilterPlusIcon } from "lucide-react";

import { SectionHeading } from "@/components/heading";

import { useSubmissions } from "../submissions-context";

import { StudentMultiSelect } from "./student-multi-select";
import { UnitMultiSelect } from "./unit-multi-select";

export function ApplyToControls() {
  const {
    visibleUnits,
    selectedUnitIds,
    setSelectedUnitIds,
    selectedStudentIds,
    setSelectedStudentIds,
    selectionMode,
    setSelectionMode,
  } = useSubmissions();

  return (
    <section className="flex flex-col gap-4">
      <div>
        <SectionHeading icon={ListFilterPlusIcon}>Apply to</SectionHeading>
        <p className="mt-1 text-sm text-muted-foreground">
          Select which units and students the quick actions should affect.
        </p>
      </div>
      <div className="grid grid-cols-2 justify-items-center gap-x-5 rounded-lg border bg-card p-4">
        <UnitMultiSelect
          units={visibleUnits}
          selected={selectedUnitIds}
          onChange={setSelectedUnitIds}
        />
        <StudentMultiSelect
          className="min-w-96 max-w-1/2"
          selectedStudentIds={selectedStudentIds}
          onSelectedStudentIdsChange={setSelectedStudentIds}
          selectionMode={selectionMode}
          onSelectionModeChange={setSelectionMode}
        />
      </div>
    </section>
  );
}
