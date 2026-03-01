import { type ClassValue } from "clsx";

import { type UnitOfAssessmentDTO } from "@/dto";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";

import { cn } from "@/lib/utils";

import { useSubmissions } from "../submissions-context";

export function UnitMultiSelect({
  uoaMap,
  className,
}: {
  uoaMap: Record<string, UnitOfAssessmentDTO>;
  className?: ClassValue;
}) {
  const {
    selection: {
      setUnitIds,
      state: { unitIds: selectedUnitIds },
    },
  } = useSubmissions();

  function toggle(id: string) {
    const next = new Set(selectedUnitIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setUnitIds(Array.from(next));
  }

  return (
    <FieldSet className={cn("mb-0", className)}>
      <FieldLegend variant="label">Units of Assessment</FieldLegend>
      <FieldDescription className="text-xs">
        Apply a change to many units at once
      </FieldDescription>
      <FieldGroup className="gap-3">
        {selectedUnitIds.map((unitId) => (
          <Field key={unitId} orientation="horizontal">
            <Checkbox
              id={`checkbox-${unitId}`}
              name={`checkbox-${unitId}`}
              checked={selectedUnitIds.includes(unitId)}
              onClick={() => toggle(unitId)}
            />
            <FieldLabel htmlFor={`checkbox-${unitId}`} className="font-normal">
              {uoaMap[unitId].title}
            </FieldLabel>
          </Field>
        ))}
      </FieldGroup>
    </FieldSet>
  );
}
