"use client";

import { RotateCcwIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { type UnitOfAssessmentDTO, type UserDTO } from "@/dto";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { WithTooltip } from "@/components/ui/tooltip-wrapper";
import { YesNoAction } from "@/components/yes-no-action";

import { useAppRouter } from "@/lib/routing";
import { api } from "@/lib/trpc/client";

import { AdminUoaMarkingLoader } from "../forms/uoa-marking-form";
import { useMarksheetContext } from "../marksheet-context";

export function UnsubmitMarksButton({
  unitId,
  marker,
}: {
  unitId: string;
  marker: UserDTO;
}) {
  const router = useAppRouter();

  const { params, studentId } = useMarksheetContext();

  const { mutateAsync: api_unsubmitMarks } =
    api.msp.admin.unitOfAssessment.unsubmitMarks.useMutation();

  return (
    <YesNoAction
      action={() => {
        void toast
          .promise(
            api_unsubmitMarks({
              params,
              studentId,
              unitId,
              markerId: marker.id,
            }),
            {
              loading: `Unsubmitting marks...`,
              success: `Marks unsubmitted successfully `,
              error: "Something went wrong",
            },
          )
          .unwrap()
          .then(() => router.refresh());
      }}
      trigger={
        <Button variant="outline" className="px-3 py-1 ml-auto">
          <WithTooltip tip={`Unsubmit marks for ${marker.name}`}>
            <RotateCcwIcon className="size-4" />
          </WithTooltip>
        </Button>
      }
      title={"Reset Marks"}
      description={
        <div>
          <p>
            This will unsubmit {marker.name}&apos;s marks for this unit of
            assessment. This does not delete data, only makes it editable for
            the marker again. Do you wish to proceed?
          </p>
        </div>
      }
    />
  );
}

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
        <Button variant="outline" className="px-3 py-1 ml-auto">
          <WithTooltip tip={`Reset marks for ${marker.name}`}>
            <Trash2Icon className="size-4" />
          </WithTooltip>
        </Button>
      }
      title={"Reset Marks"}
      description={
        <div>
          <p>
            This will reset (i.e. delete) {marker.name}&apos;s marks for this
            unit of assessment. This cannot be undone. Are you sure you wish to
            proceed?
          </p>
        </div>
      }
    />
  );
}

export function OverwriteMarks({
  unit,
  marker,
}: {
  unit: UnitOfAssessmentDTO;
  marker: UserDTO;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Overwrite Marks</Button>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>
            Overwrite marks: {marker.name} - {unit.title}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[80dvh]">
          <section className="bg-orange-300 border-orange-400 border-solid border-2 rounded-md p-5 m-2">
            <h3 className="text-3xl underline mb-2">Warning</h3>
            <p>
              This form allows you to overwrite marks provided by a marker. The
              form below is pre-populated with their current marking data
              (including the draft, if it exists).This feature should only be
              used in{" "}
              <span className="italic font-bold">
                exceptional circumstances.
              </span>{" "}
              Before doing this, consider if any of the following (more usual)
              options may suit the situation:
            </p>
            <ul className="list-disc ml-5">
              <li>Resolving a negotiation through the usual mechanism</li>
              <li>Resolving a moderation (this is a separate mechanism)</li>
              <li>Resetting the marks for a marker</li>
            </ul>
          </section>
          <Separator orientation="horizontal" className="my-10" />
          <AdminUoaMarkingLoader unit={unit} markerId={marker.id} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
