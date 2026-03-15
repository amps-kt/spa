"use client";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon } from "lucide-react";
import { toast } from "sonner";

import { type MarkOverrideDTO, markOverrideDtoSchema } from "@/dto";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { YesNoAction } from "@/components/yes-no-action";

import { GradeInput } from "./grade-input";

export function UnitOverrideForm({
  title,
  description,
  resolve,
}: {
  title: string;
  description: string;
  resolve: (data: MarkOverrideDTO) => Promise<void>;
}) {
  const form = useForm<MarkOverrideDTO>({
    resolver: zodResolver(markOverrideDtoSchema),
    reValidateMode: "onBlur",
    defaultValues: {},
  });

  const handleSubmit = form.handleSubmit((data) => {
    void toast.promise(resolve(data), {
      loading: `Submitting marks...`,
      success: `Marks submitted`,
      error: "Something went wrong",
    });
  });

  return (
    <Card className="row-span-1 mt-10">
      <CardHeader className="pt-4 pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem className="space-2 mt-2 mb-4">
                  <FormLabel className="mr-2">Grade:</FormLabel>
                  <FormControl>
                    <GradeInput
                      value={field.value}
                      setValue={(v) => {
                        field.onChange(v);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="justification"
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

            <div className="flex flex-row justify-end w-full">
              <YesNoAction
                disabled={!form.formState.isValid}
                action={() => void handleSubmit()}
                trigger={
                  <Button>
                    <SaveIcon className="size-4 mr-2" /> Save
                  </Button>
                }
                title={<div>You are about to resolve moderation</div>}
                description={
                  <>
                    Marks cannot be edited after submission. Would you like to
                    proceed?
                  </>
                }
              />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
