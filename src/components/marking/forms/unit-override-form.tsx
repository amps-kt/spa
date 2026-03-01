"use client";

import { useForm, Form } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { type MarkOverrideDTO, markOverrideDtoSchema } from "@/dto";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

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
  });

  const handleSubmit = form.handleSubmit((data) => {
    void toast.promise(resolve(data), {
      loading: `Submitting marks...`,
      success: `Marks submitted`,
      error: "Something went wrong",
    });
  });

  return (
    <Card className="row-span-1">
      <CardHeader className="pt-4 pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <CardContent>
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
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}
