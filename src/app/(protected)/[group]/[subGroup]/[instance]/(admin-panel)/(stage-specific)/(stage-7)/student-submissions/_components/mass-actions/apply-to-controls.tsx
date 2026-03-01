"use client";

import { ListFilterPlusIcon } from "lucide-react";

import { type StudentDTO, type UnitOfAssessmentDTO } from "@/dto";

import { SectionHeading } from "@/components/heading";

import { StudentMultiSelect } from "./student-multi-select";
import { UnitMultiSelect } from "./unit-multi-select";

export function ApplyToControls({
  studentMap,
  uoaMap,
}: {
  studentMap: Record<string, StudentDTO>;
  uoaMap: Record<string, UnitOfAssessmentDTO>;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <SectionHeading icon={ListFilterPlusIcon}>Apply to</SectionHeading>
        <p className="mt-1 text-sm text-muted-foreground">
          Select which units and students the quick actions should affect.
        </p>
      </div>
      <div className="grid grid-cols-2 justify-items-center gap-x-5 rounded-lg border bg-card p-4">
        <UnitMultiSelect uoaMap={uoaMap} />
        <StudentMultiSelect
          className="min-w-96 max-w-1/2"
          studentMap={studentMap}
        />
      </div>
    </section>
  );
}
