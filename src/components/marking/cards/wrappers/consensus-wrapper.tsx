"use client";

import { type ReactNode } from "react";

import { Grade } from "@/logic/grading";

import { type UnitOfAssessmentDTO } from "@/dto";

import { ConsensusStage } from "@/db/types";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ConsensusMethodBadge } from "@/components/ui/badges/consensus-method-badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { api } from "@/lib/trpc/client";

import { useMarksheetContext } from "../../marksheet-context";

export function ConsensusWrapper({
  unit,
  children,
}: {
  unit: UnitOfAssessmentDTO;
  children: ReactNode;
}) {
  const { params, studentId } = useMarksheetContext();

  const { status, data } =
    api.msp.marker.unitOfAssessment.getConsensus.useQuery({
      params,
      studentId,
      unitId: unit.id,
    });

  if (status !== "success") {
    return <Skeleton className="rounded-lg h-20" />;
  }

  if (data.status !== ConsensusStage.RESOLVED) {
    throw new Error(
      "ConsensusWrapper should not be called if ConsensusStage != RESOLVED",
    );
  }

  const entry = data.grades[0];

  return (
    <div>
      {children}

      <Separator orientation="horizontal" />
      <div>
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-lg font-semibold my-4">Consensus:</h1>
          <ConsensusMethodBadge method={entry.method} />
        </div>
        <div className="flex flex-row items-start gap-5">
          <p className="font-semibold text-secondary text-3xl">
            {Grade.toLetter(entry.grade)}
          </p>
          <p className="text-muted-foreground">{entry.comment}</p>
        </div>
      </div>

      {data.grades.length > 1 && (
        <Accordion type="single" collapsible>
          <AccordionItem value="extra-marks" className="border-none">
            <AccordionTrigger>Mark history</AccordionTrigger>
            <AccordionContent>
              {data.grades.slice(1).map((entry) => (
                <div
                  key={entry.method}
                  className="flex flex-row items-start gap-5"
                >
                  <p className="font-semibold text-secondary text-3xl">
                    {Grade.toLetter(entry.grade)}
                  </p>
                  <p className="text-muted-foreground mr-auto">
                    {entry.comment}
                  </p>
                  <ConsensusMethodBadge method={entry.method} />
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
