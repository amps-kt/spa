import { type ChangeEvent } from "react";
import { useFormContext } from "react-hook-form";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { flagsAssessmentSchema, type WizardFormData } from "../instance-wizard";

export function UploadJsonArea() {
  const form = useFormContext<WizardFormData>();

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files ?? [];
    if (fileList.length > 1) throw Error("Too many files uploaded!");

    const [file] = fileList;
    const contents = await file.text();

    const res = flagsAssessmentSchema.safeParse(JSON.parse(contents));

    if (res.success) {
      form.setValue("flags", res.data);
      toast.success("Config parsed successfully");
    } else {
      form.setError("flags", {
        message:
          "Errors at:" +
          res.error.issues
            .map((a) => `${a.path.join(".")}: ${a.message}`)
            .join("\n"),
      });
      toast.error("Issues in config file");
    }
  }

  const flags = form.watch("flags");

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="flags"
        render={() => (
          <FormItem className="flex flex-col">
            <FormControl>
              <Input
                className="w-56 cursor-pointer"
                type="file"
                accept=".json"
                onChange={(e) => handleFileChange(e)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {flags && flags.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Parsed Flags Configuration
            </h3>
            <div className="space-y-4">
              {flags.map((flag) => (
                <div key={flag.id} className="rounded-md border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="secondary">{flag.id}</Badge>
                    <span className="font-medium">{flag.displayName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {flag.description}
                  </p>
                  {flag.unitsOfAssessment.length > 0 && (
                    <div className="mt-3 space-y-2 border-l-2 pl-4">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Units of Assessment
                      </p>
                      {flag.unitsOfAssessment.map((uoa, i) => (
                        <div key={i} className="rounded border p-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {uoa.displayName}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              Weight: {uoa.weight}
                            </Badge>
                          </div>
                          {uoa.description && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {uoa.description}
                            </p>
                          )}
                          {uoa.components.length > 0 && (
                            <div className="mt-2 space-y-1 pl-3">
                              {uoa.components.map((comp, j) => (
                                <div
                                  key={j}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <span>{comp.displayName}</span>
                                  <span className="text-muted-foreground">
                                    w: {comp.weight}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
