import { type ReactNode } from "react";

import { type UnitOfAssessmentDTO } from "@/dto";

import { Separator } from "@/components/ui/separator";

import { api } from "@/lib/trpc/client";

import { UnitOverrideForm } from "../../forms/unit-override-form";
import { MarksheetRole, useMarksheetContext } from "../../marksheet-context";

export function ModerationWrapper({
  unit,
  children,
}: {
  unit: UnitOfAssessmentDTO;
  children: ReactNode;
}) {
  const { viewerRole, params, studentId } = useMarksheetContext();

  const { mutateAsync: api_resolveModeration } =
    api.msp.admin.unitOfAssessment.resolveModeration.useMutation();

  if (
    viewerRole === MarksheetRole.READER ||
    viewerRole === MarksheetRole.SUPERVISOR
  ) {
    return (
      <div>
        {children}
        <Separator orientation="horizontal" />
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
      <UnitOverrideForm
        title="Resolve Moderation"
        description="This unit must be moderated. Once moderation is complete, please enter the resolution in the form below"
        resolve={(data) =>
          api_resolveModeration({ data, params, studentId, unitId: unit.id })
        }
      />
    </div>
  );
}
