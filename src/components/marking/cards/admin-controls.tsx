"use client";

import { RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";

import { type UserDTO } from "@/dto";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";
import { YesNoAction } from "@/components/yes-no-action";

import { useAppRouter } from "@/lib/routing";
import { api } from "@/lib/trpc/client";

import { useMarksheetContext } from "../marksheet-context";

export function ResetMarksButton({
  unitId,
  marker,
}: {
  unitId: string;
  marker: UserDTO;
}) {
  const router = useAppRouter();

  const { params, studentId } = useMarksheetContext();

  const { mutateAsync: api_resetMarks } =
    api.msp.admin.unitOfAssessment.resetMarks.useMutation();

  return (
    <YesNoAction
      action={() => {
        void toast
          .promise(
            api_resetMarks({ params, studentId, unitId, markerId: marker.id }),
            {
              loading: `Resetting marks...`,
              success: `Marks reset successfully `,
              error: "Something went wrong",
            },
          )
          .unwrap()
          .then(() => router.refresh());
      }}
      trigger={
        <Button variant="outline" className="px-3 py-2 ml-auto">
          <WithTooltip tip={`Reset marks for ${marker.name}`}>
            <RotateCcwIcon className="size-4" />
          </WithTooltip>
        </Button>
      }
      title={"Reset Marks"}
      description={
        <div>
          <p>
            This will reset {marker.name}&apos;s marks for this unit of
            assessment. This cannot be undone. Are you sure you wish to proceed?
          </p>
        </div>
      }
    />
  );
}

export function OverwriteMarks() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Overwrite Marks</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Overwrite marks for ....</DialogTitle>
        </DialogHeader>
      </DialogContent>
      Warning: this is a ... and should only be used in *exceptional
      circumstances*. Before doing this, consider if any of the following (more
      usual) options may suit the situation:
      <ul>
        <li>Resolving a negotiation through the usual mechanism</li>
        <li>Resolving a moderation (this is a separate mechanism)</li>
        <li>Resetting the marks for a marker</li>
      </ul>
      {/* Then the rest: */}
      <form>
        <Button variant="destructive">Submit</Button>
      </form>
    </Dialog>
  );
}
