"use client";

import { useState } from "react";

import { RoleBadge } from "@/components/role-badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { type WizardFormData } from "../instance-wizard";

import { WeightBadge, sumWeights } from "./weight-badge";

interface FlagPreviewProps {
  flags: WizardFormData["flags"];
}

type Selection =
  | { type: "uoa"; flagIdx: number; uoaIdx: number }
  | { type: "component"; flagIdx: number; uoaIdx: number; compIdx: number };

export function FlagPreviewV4({ flags }: FlagPreviewProps) {
  const [selection, setSelection] = useState<Selection | null>(null);

  const detail = getDetail(flags, selection);

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Parsed Flags Configuration</h3>
      <div className="flex rounded-md border" style={{ height: 480 }}>
        {/* Left panel - tree */}
        <ScrollArea className="w-1/2 border-r">
          <div className="p-2">
            <Accordion type="multiple" className="space-y-1">
              {flags.map((flag, fi) => (
                <AccordionItem
                  key={flag.id}
                  value={flag.id}
                  className="border-none"
                >
                  <AccordionTrigger className="hover:no-underline rounded px-2 py-1.5 text-sm hover:bg-muted">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-xs">
                        {flag.id}
                      </Badge>
                      <span className="font-medium truncate">
                        {flag.displayName}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0 pl-4">
                    {flag.unitsOfAssessment.map((uoa, ui) => (
                      <div key={ui}>
                        <button
                          type="button"
                          onClick={() =>
                            setSelection({
                              type: "uoa",
                              flagIdx: fi,
                              uoaIdx: ui,
                            })
                          }
                          className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-sm hover:bg-muted ${
                            selection?.type === "uoa" &&
                            selection.flagIdx === fi &&
                            selection.uoaIdx === ui
                              ? "bg-muted font-medium"
                              : ""
                          }`}
                        >
                          <span className="truncate">{uoa.displayName}</span>
                          <WeightBadge
                            variant="secondary"
                            weight={uoa.weight}
                            totalWeight={sumWeights(flag.unitsOfAssessment)}
                          />
                        </button>
                        <div className="pl-3">
                          {uoa.components.map((comp, ci) => (
                            <button
                              key={ci}
                              type="button"
                              onClick={() =>
                                setSelection({
                                  type: "component",
                                  flagIdx: fi,
                                  uoaIdx: ui,
                                  compIdx: ci,
                                })
                              }
                              className={`flex w-full items-center gap-1.5 rounded px-2 py-0.5 text-left text-xs hover:bg-muted ${
                                selection?.type === "component" &&
                                selection.flagIdx === fi &&
                                selection.uoaIdx === ui &&
                                selection.compIdx === ci
                                  ? "bg-muted font-medium"
                                  : ""
                              }`}
                            >
                              <span className="text-muted-foreground">●</span>
                              <span className="truncate">
                                {comp.displayName}
                              </span>
                              <WeightBadge
                                variant="outline"
                                weight={comp.weight}
                                totalWeight={sumWeights(uoa.components)}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollArea>

        {/* Right panel - detail */}
        <ScrollArea className="w-1/2">
          <div className="p-4">
            {!detail && (
              <p className="text-sm text-muted-foreground">
                Select an item from the left to view details.
              </p>
            )}
            {detail?.type === "uoa" && (
              <UoADetail flag={detail.flag} uoa={detail.uoa} />
            )}
            {detail?.type === "component" && (
              <ComponentDetail
                flag={detail.flag}
                uoa={detail.uoa}
                comp={detail.comp}
                totalWeight={sumWeights(detail.uoa.components)}
              />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

type Flag = WizardFormData["flags"][number];
type UoA = Flag["unitsOfAssessment"][number];
type Component = UoA["components"][number];

function getDetail(
  flags: WizardFormData["flags"],
  selection: Selection | null,
) {
  if (!selection) return null;

  const flag = flags[selection.flagIdx];
  const uoa = flag.unitsOfAssessment[selection.uoaIdx];

  if (selection.type === "uoa") {
    return { type: "uoa" as const, flag, uoa };
  }

  const comp = uoa.components[selection.compIdx];
  return { type: "component" as const, flag, uoa, comp };
}

function UoADetail({ flag, uoa }: { flag: Flag; uoa: UoA }) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-base font-semibold">{uoa.displayName}</h4>
        <p className="text-xs text-muted-foreground">
          Flag: {flag.displayName}
        </p>
      </div>
      <div className="flex gap-2">
        <WeightBadge
          variant="secondary"
          weight={uoa.weight}
          totalWeight={sumWeights(flag.unitsOfAssessment)}
        />
        {uoa.allowedMarkerTypes.map((mt) => (
          <RoleBadge key={mt} role={mt} />
        ))}
      </div>
      {uoa.description && (
        <p className="text-sm text-muted-foreground">{uoa.description}</p>
      )}
      <Separator />
      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Components ({uoa.components.length})
        </p>
        <div className="space-y-2">
          {uoa.components.map((comp, j) => (
            <div key={j} className="text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{comp.displayName}</span>
                <WeightBadge
                  variant="outline"
                  weight={comp.weight}
                  totalWeight={sumWeights(uoa.components)}
                />
              </div>
              {comp.description && (
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                  {comp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComponentDetail({
  flag,
  uoa,
  comp,
  totalWeight,
}: {
  flag: Flag;
  uoa: UoA;
  comp: Component;
  totalWeight: number;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-base font-semibold">{comp.displayName}</h4>
        <p className="text-xs text-muted-foreground">
          {flag.displayName} / {uoa.displayName}
        </p>
      </div>
      <WeightBadge
        variant="outline"
        weight={comp.weight}
        totalWeight={totalWeight}
      />
      {comp.description && (
        <>
          <Separator />
          <p className="text-sm text-muted-foreground">{comp.description}</p>
        </>
      )}
    </div>
  );
}
