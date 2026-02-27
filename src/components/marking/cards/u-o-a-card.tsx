"use client";

import { type ReactNode } from "react";

import { Grade } from "@/logic/grading";
import { differenceInDays, format, addDays } from "date-fns";

import {
  type UnitOfAssessmentDTO,
  type UnitGradeDTO,
  unitToOverall,
  UnitGradingLifecycleState,
  StudentGradingLifecycleState,
} from "@/dto";

import { ConsensusStage, MarkerType } from "@/db/types";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { api } from "@/lib/trpc/client";

import { ConsensusMethodBadge } from "../consensus-method-badge";
import { useMarksheetContext } from "../marksheet-context";
import { UoaStatusIndicator } from "../uoa-status-indicator";

import { ClosedCard } from "./closed-card";
import { DoubleMarkDisplay, SingleMarkDisplay } from "./mark-display";
import { NonSubmissionCard } from "./non-submission-card";
import { UoaMarkingForm } from "./uoa-marking-form";

function getDueDate(unit: UnitOfAssessmentDTO, grade?: UnitGradeDTO): Date {
  if (!grade?.customDueDate) return unit.markerSubmissionDeadline;

  const delta = differenceInDays(
    unit.markerSubmissionDeadline,
    unit.studentSubmissionDeadline,
  );

  return addDays(grade.customDueDate, delta);
}

export function UOACard({
  unit,
  grade,
  status,
}: {
  unit: UnitOfAssessmentDTO;
  grade?: UnitGradeDTO;
  status: UnitGradingLifecycleState;
}) {
  const dueDate = getDueDate(unit, grade);
  return (
    <Card className="overflow-hidden">
      <AccordionItem
        value={unit.id}
        className="data-[state=open]:[&>.needsBorder]:border-b"
      >
        <CardHeader className="p-4 needsBorder">
          <AccordionTrigger className="p-2 gap-2 hover:no-underline hover:cursor-pointer group">
            <CardTitle className="text-xl mr-auto group-hover:underline">
              {unit.title}
            </CardTitle>
            {unitToOverall(status) !== StudentGradingLifecycleState.DONE && (
              <div className="mr-3">
                Marking Due on{" "}
                <strong className="font-bold">
                  {format(dueDate, "dd MMM yyyy")}
                </strong>
              </div>
            )}
            <UoaStatusIndicator status={status} />
          </AccordionTrigger>
        </CardHeader>
        <AccordionContent className="p-0">
          <CardContent className="p-4">
            {unit.allowedMarkerTypes.length == 1 ? (
              <SingleMarkerUnit
                markerType={unit.allowedMarkerTypes[0]}
                unit={unit}
                status={status}
              />
            ) : (
              <DoubleMarkUnit unit={unit} status={status} />
            )}
          </CardContent>
        </AccordionContent>
      </AccordionItem>
    </Card>
  );
}

function SingleMarkerUnit({
  unit,
  status,
  markerType,
}: {
  unit: UnitOfAssessmentDTO;
  status: UnitGradingLifecycleState;
  markerType: MarkerType;
}) {
  const realStatus = unitToOverall(status);

  // Pin [#e11d48] Rework with match utility?
  if (realStatus === StudentGradingLifecycleState.PENDING) {
    // Singly marked units cannot be pending
    throw new Error("cannot be pending");
  }

  if (realStatus === StudentGradingLifecycleState.DONE) {
    return (
      <ConsensusWrapper unit={unit}>
        <SingleMarkDisplay markerType={markerType} unit={unit} />
      </ConsensusWrapper>
    );
  }

  if (realStatus === StudentGradingLifecycleState.NOT_SUBMITTED) {
    return <NonSubmissionCard />;
  }

  if (realStatus === StudentGradingLifecycleState.CLOSED) {
    return <ClosedCard />;
  }

  if (realStatus === StudentGradingLifecycleState.ACTION_REQUIRED) {
    <UoaMarkingLoader unit={unit} />;
  }
}

function ConsensusWrapper({
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

  return (
    <div>
      {children}

      <Separator orientation="horizontal" />
      <div>
        <div className="flex flex-row justify-between">
          <h1 className="text-lg font-semibold my-4">Consensus:</h1>
          <ConsensusMethodBadge method={data.method} />
        </div>
        <div className="flex flex-row items-start gap-5">
          <p className="font-semibold text-secondary text-3xl">
            {Grade.toLetter(data.grade)}
          </p>
          <p className="text-muted-foreground">{data.comment}</p>
        </div>
      </div>
    </div>
  );
}

function DoubleMarkUnit({
  unit,
  status,
}: {
  unit: UnitOfAssessmentDTO;
  status: UnitGradingLifecycleState;
}) {
  // ! not done
  const markerType = "READER";

  // Pin [#e11d48] Rework with match utility?
  if (
    status === UnitGradingLifecycleState.DONE ||
    status === UnitGradingLifecycleState.AUTO_RESOLVED ||
    status === UnitGradingLifecycleState.RESOLVED_BY_MODERATION ||
    status === UnitGradingLifecycleState.RESOLVED_BY_NEGOTIATION
  ) {
    return (
      <ConsensusWrapper unit={unit}>
        <DoubleMarkDisplay unit={unit} />
      </ConsensusWrapper>
    );
  }

  if (status === UnitGradingLifecycleState.NOT_SUBMITTED) {
    return <NonSubmissionCard />;
  }

  if (status === UnitGradingLifecycleState.CLOSED) {
    return <ClosedCard />;
  }

  if (status === UnitGradingLifecycleState.IN_NEGOTIATION) {
    return (
      <NegotiationWrapper markerType={markerType}>
        <DoubleMarkDisplay unit={unit} />
      </NegotiationWrapper>
    );
  }

  if (status === UnitGradingLifecycleState.IN_MODERATION) {
    return (
      <MarkerModerationWrapper>
        <DoubleMarkDisplay unit={unit} />
      </MarkerModerationWrapper>
    );
  }

  if (status === UnitGradingLifecycleState.PENDING_2ND_MARKER) {
    return (
      <PendingWrapper>
        <DoubleMarkDisplay unit={unit} />
      </PendingWrapper>
    );
  }

  if (status === UnitGradingLifecycleState.REQUIRES_MARKING) {
    <UoaMarkingLoader unit={unit} />;
  }
}

function UoaMarkingLoader({ unit }: { unit: UnitOfAssessmentDTO }) {
  const { params, studentId, markerId } = useMarksheetContext();

  const { data: initialValues, status: queryStatus } =
    api.msp.marker.unitOfAssessment.getMarksByMarkerId.useQuery({
      params,
      studentId,
      unitId: unit.id,
      markerId,
    });
  if (queryStatus === "pending") {
    return <Skeleton className="h-60 rounded-lg" />;
  }
  return <UoaMarkingForm unit={unit} initialValues={initialValues} />;
}

function NegotiationWrapper({
  children,
  markerType,
}: {
  children: ReactNode;
  markerType: MarkerType;
}) {
  return (
    <div>
      {children}
      <Separator orientation="horizontal" />
      {markerType === MarkerType.READER ? (
        <div>
          <h3>
            This unit requires negotiation. Please contact the supervisor to
            discuss and agree a grade.
          </h3>
        </div>
      ) : (
        <div>Form goes here</div>
      )}
    </div>
  );
}

function MarkerModerationWrapper({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
      <Separator orientation="horizontal" />
      <div>
        <h3>
          This unit requires moderation. The project coordinator will contact
          you with further details
        </h3>
      </div>
    </div>
  );
}

function PendingWrapper({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
      <Separator orientation="horizontal" />
      <div>
        <h3>
          The second marker must input their grades for this unit to progress
        </h3>
      </div>
    </div>
  );
}
