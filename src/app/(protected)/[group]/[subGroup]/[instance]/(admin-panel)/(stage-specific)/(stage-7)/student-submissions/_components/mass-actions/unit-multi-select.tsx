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

export function UnitMultiSelect({
  units,
  selected,
  onChange,
  className,
}: {
  units: UnitOfAssessmentDTO[];
  selected: string[];
  onChange: (ids: string[]) => void;
  className?: ClassValue;
}) {
  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  }

  return (
    <FieldSet className={cn("mb-0", className)}>
      <FieldLegend variant="label">Units of Assessment</FieldLegend>
      <FieldDescription className="text-xs">
        Apply a change to many units at once
      </FieldDescription>
      <FieldGroup className="gap-3">
        {units.map((u) => (
          // todo: if this is checked / unchecked it should select/deselect the corresponding unit rows in the data table
          <Field key={u.id} orientation="horizontal">
            <Checkbox
              id={`checkbox-${u.id}`}
              name={`checkbox-${u.id}`}
              checked={selected.includes(u.id)}
              onClick={() => toggle(u.id)}
            />
            <FieldLabel htmlFor={`checkbox-${u.id}`} className="font-normal">
              {u.title}
            </FieldLabel>
          </Field>
        ))}
      </FieldGroup>
    </FieldSet>
  );
}
