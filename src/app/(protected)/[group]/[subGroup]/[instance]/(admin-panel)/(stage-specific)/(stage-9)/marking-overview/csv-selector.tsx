"use client";

import { DownloadIcon, FileDownIcon } from "lucide-react";

import { type FlagDTO } from "@/dto";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

import { InstanceCsvLink } from "@/lib/routing/instance-csv-link";

export function CsvSelector({ flags }: { flags: FlagDTO[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <DownloadIcon className="mr-2 size-4" />
          Download marking CSV
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-1/2">
        <DialogTitle>Download marking by student flag</DialogTitle>
        {flags.map((f) => (
          <Button
            key={f.id}
            variant="outline"
            className="flex justify-start gap-3"
            asChild
          >
            <InstanceCsvLink
              className="justify-between"
              page="markingOverviewCsv"
              linkArgs={{ flagId: f.id }}
              title={`${f.displayName}-marking`}
            >
              {f.displayName} <FileDownIcon className="size-4 " />
            </InstanceCsvLink>
          </Button>
        ))}
      </DialogContent>
    </Dialog>
  );
}
