"use client";

import { DownloadIcon } from "lucide-react";

import { useCsvExport } from "@/lib/utils/csv/use-csv-download";

import { Button } from "./ui/button";

export function ExportCSVButton<T>({
  text,
  header,
  data,
  filename,
}: {
  text?: string;
  header: string[];
  data: T[];
  filename: string;
}) {
  const { downloadLinkRef, downloadCsv } = useCsvExport({
    header: header,
    rows: data,
    filename: `${filename}.csv`,
  });

  return (
    <>
      <button className="flex items-center gap-2 text-sm" onClick={downloadCsv}>
        <DownloadIcon className="h-4 w-4" />
        {text && <span>{text}</span>}
      </button>
      <a ref={downloadLinkRef} className="hidden" />
    </>
  );
}

export function ExportCSVButton2<T>({
  text,
  header,
  data,
  filename,
}: {
  text?: string;
  header: string[];
  data: T[];
  filename: string;
}) {
  const { downloadLinkRef, downloadCsv } = useCsvExport({
    header: header,
    rows: data,
    filename: `${filename}.csv`,
  });

  return (
    <>
      <Button
        variant="outline"
        className="flex items-center gap-2 text-sm"
        onClick={downloadCsv}
      >
        <DownloadIcon className="h-4 w-4" />
        {text && <span>{text}</span>}
      </Button>
      <a ref={downloadLinkRef} className="hidden" />
    </>
  );
}
