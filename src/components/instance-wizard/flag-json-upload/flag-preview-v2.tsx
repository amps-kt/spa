"use client";

import { useState } from "react";

import { ChevronRight } from "lucide-react";

import { RoleBadge } from "@/components/role-badge";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { type WizardFormData } from "../instance-wizard";

import { WeightBadge, sumWeights } from "./weight-badge";

interface FlagPreviewProps {
  flags: WizardFormData["flags"];
}

export function FlagPreviewV2({ flags }: FlagPreviewProps) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Parsed Flags Configuration</h3>
      <div className="space-y-6">
        {flags.map((flag) => (
          <div key={flag.id}>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="secondary">{flag.id}</Badge>
              <span className="font-medium">{flag.displayName}</span>
            </div>
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2 text-left font-medium">
                      Component
                    </th>
                    <th className="w-30 px-3 py-2 text-right font-medium">
                      Weight
                    </th>
                    <th className="w-28 px-3 py-2 text-right font-medium">
                      Markers
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {flag.unitsOfAssessment.map((uoa, i) => (
                    <UoATableSection
                      key={i}
                      uoa={uoa}
                      allUoAs={flag.unitsOfAssessment}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UoATableSection({
  uoa,
  allUoAs,
}: {
  uoa: WizardFormData["flags"][number]["unitsOfAssessment"][number];
  allUoAs: WizardFormData["flags"][number]["unitsOfAssessment"];
}) {
  return (
    <>
      <tr className="border-b bg-muted/30">
        <td className="px-3 py-2 font-medium">{uoa.displayName}</td>
        <td className="px-3 py-2 text-right">
          <WeightBadge
            variant="secondary"
            weight={uoa.weight}
            totalWeight={sumWeights(allUoAs)}
          />
        </td>
        <td className="px-3 py-2 text-right">
          <div className="flex justify-end gap-1">
            {uoa.allowedMarkerTypes.map((mt) => (
              <RoleBadge key={mt} role={mt} />
            ))}
          </div>
        </td>
      </tr>
      {uoa.components.map((comp, j) => (
        <ComponentRow key={j} comp={comp} uoa={uoa} />
      ))}
    </>
  );
}

function ComponentRow({
  uoa,
  comp,
}: {
  uoa: WizardFormData["flags"][number]["unitsOfAssessment"][number];
  comp: WizardFormData["flags"][number]["unitsOfAssessment"][number]["components"][number];
}) {
  const [open, setOpen] = useState(false);
  const hasDescription = !!comp.description;

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <>
        <tr className="border-b last:border-0">
          <td className="px-3 py-1.5">
            {hasDescription ? (
              <CollapsibleTrigger className="flex items-center gap-1 text-left hover:underline">
                <ChevronRight
                  className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
                />
                <span className="pl-2">{comp.displayName}</span>
              </CollapsibleTrigger>
            ) : (
              <span className="pl-6">{comp.displayName}</span>
            )}
          </td>
          <td className="px-3 py-1.5 text-right text-muted-foreground">
            <WeightBadge
              variant="outline"
              weight={comp.weight}
              totalWeight={sumWeights(uoa.components)}
            />
          </td>
          <td />
        </tr>
        {hasDescription && (
          <CollapsibleContent asChild>
            <tr className="border-b last:border-0">
              <td colSpan={3} className="px-3 py-2 pl-9">
                <p className="text-xs text-muted-foreground">
                  {comp.description}
                </p>
              </td>
            </tr>
          </CollapsibleContent>
        )}
      </>
    </Collapsible>
  );
}
