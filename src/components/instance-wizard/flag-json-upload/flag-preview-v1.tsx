import { RoleBadge } from "@/components/role-badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

import { type WizardFormData } from "../instance-wizard";

import { WeightBadge, sumWeights } from "./weight-badge";

export function FlagPreviewV1({ flags }: { flags: WizardFormData["flags"] }) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Parsed Flags Configuration</h3>
      <Accordion type="multiple" className="space-y-2">
        {flags.map((flag) => (
          <AccordionItem
            key={flag.id}
            value={flag.id}
            className="border rounded-md px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{flag.id}</Badge>
                <span className="font-medium">{flag.displayName}</span>
                <span className="text-xs text-muted-foreground">
                  {flag.unitsOfAssessment.length} UoA
                  {flag.unitsOfAssessment.length !== 1 && "s"}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {flag.description && (
                <p className="mb-3 text-sm text-muted-foreground">
                  {flag.description}
                </p>
              )}
              <Accordion type="multiple" className="space-y-1">
                {flag.unitsOfAssessment.map((uoa, i) => (
                  <AccordionItem
                    key={i}
                    value={`${flag.id}-uoa-${i}`}
                    className="border rounded px-3"
                  >
                    <AccordionTrigger className="hover:no-underline py-2 text-sm">
                      <div className="flex items-center gap-2 w-full">
                        <span className="font-medium">{uoa.displayName}</span>
                        <span className="text-xs text-muted-foreground">
                          {uoa.components.length} component
                          {uoa.components.length !== 1 && "s"}
                        </span>
                        <span className="ml-auto" />
                        {uoa.allowedMarkerTypes.map((mt) => (
                          <RoleBadge key={mt} role={mt} />
                        ))}
                        <WeightBadge
                          variant="secondary"
                          weight={uoa.weight}
                          totalWeight={sumWeights(flag.unitsOfAssessment)}
                        />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {uoa.description && (
                        <p className="mb-2 text-xs text-muted-foreground">
                          {uoa.description}
                        </p>
                      )}
                      <div className="space-y-3.5 pl-2">
                        {uoa.components.map((comp, j) => (
                          <div key={j} className="text-sm">
                            <div className="flex items-center gap-2">
                              <span>{comp.displayName}</span>
                              <span className="ml-auto" />
                              <WeightBadge
                                variant="outline"
                                weight={comp.weight}
                                totalWeight={sumWeights(uoa.components)}
                              />
                              <span className="mr-[9px]" />
                            </div>
                            {comp.description && (
                              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                {comp.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
