"use client";

import { type ReactNode } from "react";

import { Grade } from "@/logic/grading";

import { type GradeEntryDTO, type UnitOfAssessmentDTO } from "@/dto";

import { ConsensusMethodBadge } from "@/components/ui/badges/consensus-method-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { useAppRouter } from "@/lib/routing";
import { api } from "@/lib/trpc/client";

import { UnitOverrideForm } from "../../forms/unit-override-form";
import { MarksheetRole, useMarksheetContext } from "../../marksheet-context";

export function ModerationNegotiationWrapper({
  unit,
  children,
}: {
  unit: UnitOfAssessmentDTO;
  children: ReactNode;
}) {
  const router = useAppRouter();
  const { viewerRole, params, studentId } = useMarksheetContext();

  const { mutateAsync: api_resolveModeration } =
    api.msp.admin.unitOfAssessment.resolveModeration.useMutation();

  const {
    status,
    data,
    refetch: refetch_consensus,
  } = api.msp.marker.unitOfAssessment.getConsensus.useQuery({
    params,
    studentId,
    unitId: unit.id,
  });

  if (status !== "success") {
    return <Skeleton className="rounded-lg h-20" />;
  }

  const entry = data.grades[0];

  if (
    viewerRole === MarksheetRole.READER ||
    viewerRole === MarksheetRole.SUPERVISOR
  ) {
    return (
      <div>
        {children}
        <Separator orientation="horizontal" />
        <NegotiationMarks entry={entry} />
        <div className="my-10">
          <h3 className="text-xl font-semibold">
            This unit requires moderation. The project coordinator will contact
            you with further details.
          </h3>
        </div>
      </div>
    );
  }
  return (
    <div>
      {children}
      <Separator orientation="horizontal" />
      <NegotiationMarks entry={entry} />

      <UnitOverrideForm
        title="Resolve Moderation"
        description="This unit must be moderated. Once moderation is complete, please enter the resolution in the form below"
        resolve={(data) =>
          api_resolveModeration({
            data,
            params,
            studentId,
            unitId: unit.id,
          }).then(async () => {
            router.refresh();
            await refetch_consensus();
          })
        }
      />
    </div>
  );
}

function NegotiationMarks({ entry }: { entry: GradeEntryDTO }) {
  return (
    <Card className="mt-4">
      <CardHeader className="pt-4 pb-2 flex flex-row justify-between">
        <CardTitle className="text-lg">Negotiation result:</CardTitle>

        <ConsensusMethodBadge method={entry.method} />
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-start gap-5">
          <p className="font-semibold text-secondary text-3xl">
            {Grade.toLetter(entry.grade)}
          </p>
          <p className="text-muted-foreground">{entry.comment}</p>
        </div>
      </CardContent>
    </Card>
  );
}
