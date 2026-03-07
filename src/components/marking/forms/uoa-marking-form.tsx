"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";

import { Grade } from "@/logic/grading";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon } from "lucide-react";
import { toast } from "sonner";

import {
  type MarkingSubmissionDTO,
  markingSubmissionDtoSchema,
  type UnitOfAssessmentDTO,
} from "@/dto";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { YesNoAction } from "@/components/yes-no-action";

import { useAppRouter } from "@/lib/routing";
import { api } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

import { useMarksheetContext } from "../marksheet-context";

import { ComponentMarkInput } from "./component-mark-input";

export function UoaMarkingLoader({ unit }: { unit: UnitOfAssessmentDTO }) {
  const { params, studentId, userId } = useMarksheetContext();

  const { data: initialValues, status: queryStatus } =
    api.msp.marker.unitOfAssessment.getMarksByMarkerId.useQuery({
      params,
      studentId,
      unitId: unit.id,
      markerId: userId,
    });

  if (queryStatus === "pending") {
    return <Skeleton className="h-60 rounded-lg" />;
  }

  return (
    <UoaMarkingForm unit={unit} initialValues={initialValues ?? undefined} />
  );
}

function formatGrade(grade: number | undefined) {
  if (grade === undefined) return "-";
  return Grade.toLetter(grade);
}

export function UoaMarkingForm({
  unit: { components, id: unitOfAssessmentId },
  initialValues,
}: {
  unit: UnitOfAssessmentDTO;
  initialValues?: MarkingSubmissionDTO;
}) {
  const router = useAppRouter();

  const { params, studentId, userId } = useMarksheetContext();

  const { mutateAsync: saveMarks } =
    api.msp.marker.unitOfAssessment.saveMarks.useMutation();

  const { mutateAsync: submitMarks } =
    api.msp.marker.unitOfAssessment.submitMarks.useMutation();

  const form = useForm<MarkingSubmissionDTO>({
    resolver: zodResolver(markingSubmissionDtoSchema),
    reValidateMode: "onBlur",
    defaultValues: initialValues ?? {
      draft: true,
      recommendation: false,
      markerId: userId,
      studentId,
      unitOfAssessmentId,
    },
  });

  const handleSubmit = form.handleSubmit((data: MarkingSubmissionDTO) => {
    if (data.draft) {
      void toast.promise(
        saveMarks({ params, studentId, unitId: unitOfAssessmentId, data }),
        {
          loading: `Saving draft marks...`,
          success: `Draft marks saved`,
          error: "Something went wrong",
        },
      );
    } else {
      void toast
        .promise(
          submitMarks({ params, studentId, unitId: unitOfAssessmentId, data }),
          {
            loading: `Submitting marks...`,
            success: `Marks submitted`,
            error: "Something went wrong",
          },
        )
        .unwrap()
        .then(() => router.refresh());
    }
  });

  const computeOverall = useCallback(() => {
    const marks = form.getValues("marks");
    if (components.some((c) => marks?.[c.id]?.mark === undefined)) return;

    const scores = components.map((c) => ({
      weight: c.weight,
      score: marks[c.id].mark!,
    }));

    form.setValue("grade", Grade.weightedAverage(scores), {
      shouldValidate: true,
    });
  }, [components, form]);

  const grade = form.watch("grade");
  const draft = form.watch("draft");

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="grid gap-2">
        {components.map((c) => (
          <ComponentMarkInput
            key={c.id}
            component={c}
            control={form.control}
            computeOverall={computeOverall}
          />
        ))}

        <div className="my-4 px-4 flex flex-col justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold my-4">Overall:</h1>

            <p
              className={cn(
                "font-semibold text-secondary text-3xl",
                grade === undefined && "text-muted-foreground",
              )}
            >
              {formatGrade(grade)}
            </p>
          </div>
          {components.length > 1 && (
            <FormField
              control={form.control}
              name="finalComment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormDescription>
                    A short summary of your evaluation or additional comments
                  </FormDescription>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <div className="h-6">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          )}
          <div className="flex flex-row gap-2 items-center">
            <p className="text-muted-foreground w-3/4 mr-auto">
              Saving as draft allows you to continue editing later. Submitting
              marks finalises your evaluation.
            </p>
            <FormField
              control={form.control}
              name="draft"
              render={({ field }) => (
                <FormItem
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "hover:bg-white flex flex-row items-center gap-2",
                  )}
                >
                  <p className="mb-0 font-medium">Draft</p>
                  <FormControl>
                    <Switch
                      className="mb-0"
                      // Inverted here since 'on' needs to indicate 'final', rather than draft
                      checked={!field.value}
                      onCheckedChange={(v) => {
                        field.onChange(!v);
                        void form.trigger();
                      }}
                    />
                  </FormControl>
                  <p className="mb-0 font-medium">Final</p>
                </FormItem>
              )}
            />

            {draft ? (
              <Button type="submit">
                <SaveIcon className="size-4 mr-2" />
                Save
              </Button>
            ) : (
              <YesNoAction
                disabled={!form.formState.isValid}
                action={() => void handleSubmit()}
                trigger={
                  <Button>
                    Save <SaveIcon className="size-4 ml-2" />
                  </Button>
                }
                title={<div>You are about to submit your marks</div>}
                description={
                  <>
                    Marks cannot be edited after submission. Would you like to
                    proceed?
                  </>
                }
              />
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
