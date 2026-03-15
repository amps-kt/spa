"use client";

import { differenceInDays, format, addDays } from "date-fns";

import {
  type UnitOfAssessmentDTO,
  type UnitGradeDTO,
  unitToOverall,
  UnitGradingLifecycleState,
  StudentGradingLifecycleState,
} from "@/dto";

import { MarkerType } from "@/db/types";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { UnitGradingLifecycleBadge } from "@/components/ui/badges/unit-grading-lifecycle-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { UoaMarkingLoader } from "../forms/uoa-marking-form";
import { MarksheetRole, useMarksheetContext } from "../marksheet-context";

import { ConsensusWrapper } from "./wrappers/consensus-wrapper";
import { ModerationNegotiationWrapper } from "./wrappers/moderation-negotiation-wrapper";
import { ModerationWrapper } from "./wrappers/moderation-wrapper";
import { NegotiationWrapper } from "./wrappers/negotiation-wrapper";
import { PendingWrapper } from "./wrappers/pending-wrapper";

import { ClosedCard } from "./closed-card";
import { DoubleMarkDisplay, SingleMarkDisplay } from "./mark-display";
import { NonSubmissionCard } from "./non-submission-card";

export function getDueDate(
  unit: UnitOfAssessmentDTO,
  grade?: UnitGradeDTO,
): Date {
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
            <UnitGradingLifecycleBadge status={status} />
          </AccordionTrigger>
        </CardHeader>
        <AccordionContent className="p-0">
          <CardContent className="p-4">
            {unit.allowedMarkerTypes.length == 1 ? (
              <SingleMarkerUnit
                unit={unit}
                status={status}
                markerType={unit.allowedMarkerTypes[0]}
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
  const { viewerRole } = useMarksheetContext();

  // Pin [#e11d48] Rework with match utility?
  if (realStatus === StudentGradingLifecycleState.PENDING) {
    throw new Error("Singly marked units cannot be pending");
  }

  if (realStatus === StudentGradingLifecycleState.DONE) {
    // todo: might be necessary if the grade is changed by admin
    return <SingleMarkDisplay markerType={markerType} unit={unit} />;
  }

  if (realStatus === StudentGradingLifecycleState.NOT_SUBMITTED) {
    return <NonSubmissionCard />;
  }

  if (realStatus === StudentGradingLifecycleState.CLOSED) {
    return <ClosedCard />;
  }

  if (realStatus === StudentGradingLifecycleState.ACTION_REQUIRED) {
    if (marksRequired(markerType, viewerRole)) {
      return <UoaMarkingLoader unit={unit} />;
    } else {
      return <SingleMarkDisplay markerType={markerType} unit={unit} />;
    }
  }
}

function marksRequired(allowedMarker: MarkerType, role: MarksheetRole) {
  const dict: Record<MarksheetRole, boolean> = {
    [MarksheetRole.ADMIN]: false,
    [MarksheetRole.READER]: allowedMarker === MarkerType.READER,
    [MarksheetRole.READER_ADMIN]: allowedMarker === MarkerType.READER,
    [MarksheetRole.SUPERVISOR]: allowedMarker === MarkerType.SUPERVISOR,
    [MarksheetRole.SUPERVISOR_ADMIN]: allowedMarker === MarkerType.SUPERVISOR,
  };

  return dict[role];
}

function DoubleMarkUnit({
  unit,
  status,
}: {
  unit: UnitOfAssessmentDTO;
  status: UnitGradingLifecycleState;
}) {
  const { viewerRole } = useMarksheetContext();

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
      <NegotiationWrapper unit={unit}>
        <DoubleMarkDisplay unit={unit} />
      </NegotiationWrapper>
    );
  }

  if (status === UnitGradingLifecycleState.IN_MODERATION) {
    return (
      <ModerationWrapper unit={unit}>
        <DoubleMarkDisplay unit={unit} />
      </ModerationWrapper>
    );
  }

  if (status === UnitGradingLifecycleState.IN_MODERATION_AFTER_NEGOTIATION) {
    return (
      <ModerationNegotiationWrapper unit={unit}>
        <DoubleMarkDisplay unit={unit} />
      </ModerationNegotiationWrapper>
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
    if (viewerRole === MarksheetRole.ADMIN) {
      return (
        <PendingWrapper>
          <DoubleMarkDisplay unit={unit} />
        </PendingWrapper>
      );
    } else {
      return <UoaMarkingLoader unit={unit} />;
    }
  }
}
