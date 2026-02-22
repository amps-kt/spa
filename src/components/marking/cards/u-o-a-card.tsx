"use client";

import { type ReactNode } from "react";

import { differenceInDays, format, addDays } from "date-fns";

import { Grade } from "@/config/grades";

import {
  type UnitOfAssessmentDTO,
  type UnitGradeDTO,
  UnitMarkingStatus,
  unitToOverall,
  OverallMarkingStatus,
} from "@/dto";

import { MarkerType } from "@/db/types";

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
  status: UnitMarkingStatus;
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
            {unitToOverall(status) !== OverallMarkingStatus.DONE && (
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
  status: UnitMarkingStatus;
  markerType: MarkerType;
}) {
  const realStatus = unitToOverall(status);

  // Pin [#e11d48] Rework with match utility?

  if (realStatus === OverallMarkingStatus.PENDING) {
    // Singly marked units cannot be pending
    throw new Error("cannot be pending");
  }

  if (realStatus === OverallMarkingStatus.DONE) {
    return (
      <ConsensusWrapper unit={unit}>
        <SingleMarkDisplay markerType={markerType} unit={unit} />
      </ConsensusWrapper>
    );
  }

  if (realStatus === OverallMarkingStatus.NOT_SUBMITTED) {
    return <NonSubmissionCard />;
  }

  if (realStatus === OverallMarkingStatus.CLOSED) {
    return <ClosedCard />;
  }

  if (realStatus === OverallMarkingStatus.ACTION_REQUIRED) {
    return <UoaMarkingForm unit={unit} />;
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

  const { status, data } = api.user.newMarker.getConsensusGrade.useQuery({
    params,
    studentId,
    unitId: unit.id,
  });

  if (status !== "success") {
    return <Skeleton className="rounded-lg h-20" />;
  }

  return (
    <div>
      {children}

      <Separator orientation="horizontal" />
      <div>
        <div className="flex flex-row justify-between">
          <h1 className="text-lg font-semibold my-4">Consensus:</h1>
          <ConsensusMethodBadge method={data.unitGrade.method} />
        </div>
        <div className="flex flex-row items-start gap-5">
          <p className="font-semibold text-secondary text-3xl">
            {Grade.toLetter(data.unitGrade.grade)}
          </p>
          <p className="text-muted-foreground">{data.unitGrade.comment}</p>
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
  status: UnitMarkingStatus;
}) {
  const markerType = "READER";

  // Pin [#e11d48] Rework with match utility?
  if (
    status === UnitMarkingStatus.DONE ||
    status === UnitMarkingStatus.AUTO_RESOLVED ||
    status === UnitMarkingStatus.MODERATED ||
    status === UnitMarkingStatus.NEGOTIATED
  ) {
    return (
      <ConsensusWrapper unit={unit}>
        <DoubleMarkDisplay unit={unit} />
      </ConsensusWrapper>
    );
  }

  if (status === UnitMarkingStatus.NOT_SUBMITTED) {
    return <NonSubmissionCard />;
  }

  if (status === UnitMarkingStatus.CLOSED) {
    return <ClosedCard />;
  }

  if (status === UnitMarkingStatus.IN_NEGOTIATION) {
    return (
      <NegotiationWrapper markerType={markerType}>
        <DoubleMarkDisplay unit={unit} />
      </NegotiationWrapper>
    );
  }

  if (status === UnitMarkingStatus.IN_MODERATION) {
    return (
      <MarkerModerationWrapper>
        <DoubleMarkDisplay unit={unit} />
      </MarkerModerationWrapper>
    );
  }

  if (status === UnitMarkingStatus.PENDING_2ND_MARKER) {
    return (
      <PendingWrapper>
        <DoubleMarkDisplay unit={unit} />
      </PendingWrapper>
    );
  }

  if (status === UnitMarkingStatus.REQUIRES_MARKING) {
    return <UoaMarkingForm unit={unit} />;
  }
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
