"use client";

import { type Control } from "react-hook-form";

import { type MarkingComponentDTO, type MarkingSubmissionDTO } from "@/dto";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import { GradeInput } from "./grade-input";

export function ComponentMarkInput({
  control,
  component: { title, description, id },
  computeOverall,
}: {
  control: Control<MarkingSubmissionDTO>;
  component: MarkingComponentDTO;
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
            <FormItem className="space-2 mt-2 mb-4">
              <FormLabel className="mr-2">Grade:</FormLabel>
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
