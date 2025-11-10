import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, TextCursorInputIcon } from "lucide-react";

import { INSTITUTION } from "@/config/institution";

import { Reader } from "@/data-objects";

import { SectionHeading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { type NewReader } from "./types";

const blankReaderForm = {
  fullName: "",
  institutionId: "",
  email: "",
  readingWorkloadQuota: "" as unknown as number,
};

// TODO: refactor csv upload to use more standard data shapes
export function FormSection({
  handleAddReader,
}: {
  handleAddReader: (newReader: NewReader) => Promise<void>;
}) {
  const form = useForm<NewReader>({
    resolver: zodResolver(Reader.newCSVSchema),
    defaultValues: blankReaderForm,
  });

  async function onSubmit(data: NewReader) {
    await handleAddReader(data).then(() => {
      form.reset(blankReaderForm);
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col items-start gap-3"
      >
        <SectionHeading icon={TextCursorInputIcon} className="mb-2">
          Manually create Reader
        </SectionHeading>
        <div className="flex w-full items-center justify-start gap-5">
          {/* // TODO: don't allow special characters */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="w-1/4">
                <FormControl>
                  <Input placeholder="Full Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="institutionId"
            render={({ field }) => (
              <FormItem className="w-1/6">
                <FormControl>
                  <Input placeholder={INSTITUTION.ID_NAME} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-1/4">
                <FormControl>
                  <Input placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="readingWorkloadQuota"
            render={({ field }) => (
              <FormItem className="w-1/6">
                <FormControl>
                  <Input placeholder="Reading Workload Quota" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button size="icon" variant="secondary">
            <PlusIcon className="h-4 w-4 stroke-white stroke-3" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
