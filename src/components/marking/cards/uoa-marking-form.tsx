"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { type Control, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { type MarkingComponent } from "@prisma/client";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import z from "zod";

import { Grade, GRADES } from "@/config/grades";

import { type UnitOfAssessmentDTO } from "@/dto";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { YesNoAction } from "@/components/yes-no-action";

import { cn } from "@/lib/utils";

export const componentScoreDtoSchema = z.object({
  mark: z.number().int().nonnegative(),
  justification: z.string().min(1),
});

const formSchema = z.discriminatedUnion("draft", [
  z.object({
    draft: z.literal(true),
    markerId: z.string(),
    studentId: z.string(),
    unitOfAssessmentId: z.string(),
    grade: z.number().int().nonnegative().optional(),
    finalComment: z.string().optional(),
    recommendation: z.boolean(),
    marks: z.record(
      z.string(), // assessmentCriterionId
      componentScoreDtoSchema.partial(),
    ),
  }),
  z.object({
    draft: z.literal(false),
    markerId: z.string(),
    studentId: z.string(),
    unitOfAssessmentId: z.string(),
    grade: z.number().int().nonnegative(),
    finalComment: z.string(),
    recommendation: z.boolean(),
    marks: z.record(
      z.string(), // assessmentCriterionId
      componentScoreDtoSchema,
    ),
  }),
]);

type FormData = z.infer<typeof formSchema>;

function formatGrade(grade: number | undefined) {
  if (grade === undefined) return "-";
  return Grade.toLetter(grade);
}

export function UoaMarkingForm({
  unit: { components },
}: {
  unit: UnitOfAssessmentDTO;
}) {
  const saveMarks = undefined;
  const submitMarks = undefined;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onBlur",
    defaultValues: {
      draft: true,
      finalComment: "",
      markerId: "jake",
      studentId: "john",
      unitOfAssessmentId: "doobery",
      recommendation: false,
    },
  });

  const handleSubmit = form.handleSubmit((data: FormData) => {
    if (data.draft) {
      console.log("Saved as draft", data);
      // ...
    } else {
      console.log("Submitted!", data);
      // ...
    }
  });

  const computeOverall = useCallback(() => {
    const marks = form.getValues("marks");
    if (components.some((c) => marks?.[c.id]?.mark === undefined)) return;

    const scores = components.map((c) => ({
      weight: c.weight,
      score: marks[c.id].mark!,
    }));

    const grade = Grade.weightedAverage(scores);
    form.setValue("grade", grade, { shouldValidate: true });
  }, [components, form]);

  useEffect(computeOverall, [computeOverall]);

  const grade = form.watch("grade");
  const draft = form.watch("draft");

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={handleSubmit} className="grid gap-2">
        {components.map((c) => (
          <ComponentMarkInput
            key={c.id}
            component={c}
            control={form.control}
            computeOverall={computeOverall}
          />
        ))}

        <div className="my-4 px-4 flex flex-row justify-between">
          <div>
            <h3>overall mark:</h3>
            <p className="font-semibold text-secondary text-3xl">
              {formatGrade(grade)}
            </p>
            {components.length > 1 ? (
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
                  </FormItem>
                )}
              />
            ) : (
              <Fragment />
            )}
          </div>

          <div>
            <h1 className="text-lg font-semibold my-4">Save or Submit</h1>

            <FormField
              control={form.control}
              name="draft"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Draft:</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div>
              {draft ? (
                <Button type="submit">Save</Button>
              ) : (
                <YesNoAction
                  disabled={!form.formState.isValid}
                  action={handleSubmit}
                  trigger={<Button>Submit</Button>}
                  title={<div>You are about to submit your marks</div>}
                  description={
                    <p>
                      Marks cannot be edited after submission. Would you like to
                      proceed?
                    </p>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

function ComponentMarkInput({
  control,
  component: { title, description, id },
  computeOverall,
}: {
  control: Control<FormData>;
  component: MarkingComponent;
  computeOverall: () => void;
}) {
  return (
    <Card className="row-span-1">
      <CardHeader className="pt-4 pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name={`marks.${id}.mark`}
          render={({ field }) => (
            <FormItem className="space-y-2 mt-2 mb-4">
              <FormLabel>Grade:</FormLabel>
              <FormControl>
                <GradeInput
                  value={field.value}
                  setValue={(v) => {
                    field.onChange(v);
                    computeOverall();
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`marks.${id}.justification`}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-1">
              <FormLabel className="text-muted-foreground">
                Justification
              </FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

function GradeInput({
  value,
  setValue,
}: {
  value: number | undefined;
  setValue: (newVal: number | undefined) => void;
}) {
  const dropDownDefaultVal = "??";
  const [open, setOpen] = useState(false);

  const hasGrade = value !== undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between text-muted-foreground",
            hasGrade && "text-foreground",
          )}
        >
          <span>
            {hasGrade
              ? (GRADES.find((grade) => grade.value === value)?.label ??
                dropDownDefaultVal)
              : dropDownDefaultVal}
          </span>
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search grade..." />
          <CommandList>
            <CommandEmpty>No grade found.</CommandEmpty>
            <CommandGroup>
              {GRADES.map((grade) => (
                <CommandItem
                  key={grade.value}
                  onSelect={() => {
                    setValue(grade.value);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      grade.value === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {grade.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
