"use client";

import { type ReactNode } from "react";

import { type UnitOfAssessmentDTO } from "@/dto";

import { Separator } from "@/components/ui/separator";

import { useAppRouter } from "@/lib/routing";
import { api } from "@/lib/trpc/client";

import { UnitOverrideForm } from "../../forms/unit-override-form";
import { MarksheetRole, useMarksheetContext } from "../../marksheet-context";

export function NegotiationWrapper({
  unit,
  children,
}: {
  unit: UnitOfAssessmentDTO;
  children: ReactNode;
}) {
  const router = useAppRouter();

  const { viewerRole, params, studentId } = useMarksheetContext();

  const { mutateAsync: api_resolveNegotiation } =
    api.msp.marker.unitOfAssessment.resolveNegotiation.useMutation();

  return (
    <div>
      {children}
      <Separator orientation="horizontal" />
      {viewerRole === MarksheetRole.READER ||
      viewerRole === MarksheetRole.READER_ADMIN ? (
        <div className="my-10">
          <h3 className="text-xl font-semibold">
            This unit requires negotiation. Please contact the supervisor to
            discuss and agree a grade.
          </h3>
        </div>
      ) : (
        <UnitOverrideForm
          title="Resolve Negotiation"
          description="The marks for this unit differ by too great an amount to be resolved automatically. Please contact the reader and come to an agreement. When you have done this, you should enter your resolution in the form below."
          resolve={(data) =>
            api_resolveNegotiation({
              data,
              params,
              studentId,
              unitId: unit.id,
            }).then(() => {
              router.refresh();
            })
          }
        />
      )}
    </div>
  );
}
