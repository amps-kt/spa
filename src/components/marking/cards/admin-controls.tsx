"use client";

import { useState } from "react";

import {
  FilePenIcon,
  MoreVerticalIcon,
  RotateCcwIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { toast } from "sonner";

import { type UnitOfAssessmentDTO, type UserDTO } from "@/dto";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { YesNoActionContainer } from "@/components/yes-no-action";

import { useAppRouter } from "@/lib/routing";
import { api } from "@/lib/trpc/client";

import { AdminUoaMarkingLoader } from "../forms/uoa-marking-form";
import { useMarksheetContext } from "../marksheet-context";

export function AdminControlsMenu({
  unit,
  marker,
  dataPresent,
}: {
  unit: UnitOfAssessmentDTO;
  marker: UserDTO;
  dataPresent: boolean;
}) {
  const router = useAppRouter();
  const { params, studentId } = useMarksheetContext();

  const [unsubmitOpen, setUnsubmitOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [overwriteOpen, setOverwriteOpen] = useState(false);

  const { mutateAsync: api_unsubmitMarks } =
    api.msp.admin.unitOfAssessment.unsubmitMarks.useMutation();
  const { mutateAsync: api_resetMarks } =
    api.msp.admin.unitOfAssessment.resetMarks.useMutation();

  function handleUnsubmit() {
    void toast
      .promise(
        api_unsubmitMarks({
          params,
          studentId,
          unitId: unit.id,
          markerId: marker.id,
        }),
        {
          loading: "Unsubmitting marks...",
          success: "Marks unsubmitted successfully",
          error: "Something went wrong",
        },
      )
      .unwrap()
      .then(() => router.refresh());
  }

  function handleReset() {
    void toast
      .promise(
        api_resetMarks({
          params,
          studentId,
          unitId: unit.id,
          markerId: marker.id,
        }),
        {
          loading: "Resetting marks...",
          success: "Marks reset successfully",
          error: "Something went wrong",
        },
      )
      .unwrap()
      .then(() => router.refresh());
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 ml-auto cursor-auto"
            aria-label="Admin actions"
          >
            <MoreVerticalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Admin actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {dataPresent && (
            <>
              <DropdownMenuItem
                onSelect={() => setUnsubmitOpen(true)}
                className="gap-2"
              >
                <RotateCcwIcon className="size-4" />
                <span>Unsubmit marks</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setResetOpen(true)}
                className="gap-2"
              >
                <Trash2Icon className="size-4" />
                <span>Reset marks</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onSelect={() => setOverwriteOpen(true)}
            className="gap-2 text-destructive focus:bg-red-100/40 focus:text-destructive"
          >
            <FilePenIcon className="size-4" />
            <span>Overwrite marks</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <YesNoActionContainer
        open={unsubmitOpen}
        onOpenChange={setUnsubmitOpen}
        action={handleUnsubmit}
        title="Unsubmit Marks"
        description={
          <p>
            This will unsubmit {marker.name}&apos;s marks for this unit of
            assessment. This does not delete data, only makes it editable for
            the marker again. Do you wish to proceed?
          </p>
        }
      />
      <YesNoActionContainer
        open={resetOpen}
        onOpenChange={setResetOpen}
        action={handleReset}
        title="Reset Marks"
        description={
          <p>
            This will reset (i.e. delete) {marker.name}&apos;s marks for this
            unit of assessment. This cannot be undone. Are you sure you wish to
            proceed?
          </p>
        }
      />

      <Dialog open={overwriteOpen} onOpenChange={setOverwriteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Overwrite marks: {marker.name} - {unit.title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[80dvh]">
            <section className="bg-amber-400/25 border-amber-400 border-solid border-2 rounded-md p-5 m-2">
              <h3 className="text-2xl mb-2 flex items-center gap-2 text-amber-700">
                <TriangleAlertIcon className="size-6" />
                Warning
              </h3>
              <p>
                This form allows you to overwrite marks provided by a marker.
                The form below is pre-populated with their current marking data
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
    </>
  );
}
