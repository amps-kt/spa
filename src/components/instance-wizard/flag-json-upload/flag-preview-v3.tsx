import { RoleBadge } from "@/components/role-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { type WizardFormData } from "../instance-wizard";

import { WeightBadge, sumWeights } from "./weight-badge";

interface FlagPreviewProps {
  flags: WizardFormData["flags"];
}

export function FlagPreviewV3({ flags }: FlagPreviewProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Parsed Flags Configuration
        </h3>
        <div className="space-y-4">
          {flags.map((flag) => (
            <Card key={flag.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Badge variant="secondary">{flag.id}</Badge>
                  {flag.displayName}
                </CardTitle>
                {flag.description && (
                  <p className="text-sm text-muted-foreground">
                    {flag.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {flag.unitsOfAssessment.map((uoa, i) => (
                  <div key={i}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {uoa.displayName}
                      </span>
                      <WeightBadge
                        variant="secondary"
                        weight={uoa.weight}
                        totalWeight={sumWeights(flag.unitsOfAssessment)}
                      />
                      {uoa.allowedMarkerTypes.map((mt) => (
                        <RoleBadge key={mt} role={mt} />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {uoa.components.map((comp, j) => (
                        <ComponentPill
                          key={j}
                          comp={comp}
                          totalWeight={sumWeights(uoa.components)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

function ComponentPill({
  comp,
  totalWeight,
}: {
  comp: WizardFormData["flags"][number]["unitsOfAssessment"][number]["components"][number];
  totalWeight: number;
}) {
  const pill = (
    <div className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1.5 text-xs">
      <span>{comp.displayName}</span>
      <WeightBadge
        variant="outline"
        weight={comp.weight}
        totalWeight={totalWeight}
      />
    </div>
  );

  if (!comp.description) return pill;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="cursor-help text-left">
          {pill}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-xs">
        {comp.description}
      </TooltipContent>
    </Tooltip>
  );
}
