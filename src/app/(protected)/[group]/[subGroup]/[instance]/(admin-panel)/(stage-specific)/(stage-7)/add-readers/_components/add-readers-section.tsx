"use client";

import { useRef, useState } from "react";

import { TRPCClientError } from "@trpc/client";
import { FileSpreadsheetIcon, FileText, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { spacesLabels } from "@/config/spaces";

import { type ReaderDTO } from "@/dto";
import { type LinkUserResult } from "@/dto/result/link-user-result";

import { CodeSnippet } from "@/components/code-snippet";
import { SectionHeading } from "@/components/heading";
import { useInstanceParams } from "@/components/params-context";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/data-table/data-table";
import { LabelledSeparator } from "@/components/ui/labelled-separator";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { api } from "@/lib/trpc/client";

import { CSVUploadButton } from "./csv-upload-button";
import { type ProcessingResult } from "./csv-validation-utils";
import { FormSection } from "./form-section";
import { useNewReaderColumns } from "./new-reader-columns";
import { newReaderSchema, type NewReader } from "./new-reader-schema";

export function AddReadersSection() {
  const router = useRouter();
  const params = useInstanceParams();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [processingResult, setProcessingResult] =
    useState<ProcessingResult | null>(null);

  const addReadersCsvHeaders = newReaderSchema.keyof().options.toSorted();

  const { data, isLoading, refetch } =
    api.institution.instance.getReaders.useQuery({ params });

  const { mutateAsync: api_addReader } =
    api.institution.instance.addReader.useMutation();

  const { mutateAsync: api_addManyReaders } =
    api.institution.instance.addManyReaders.useMutation();

  const { mutateAsync: api_deleteReader } =
    api.institution.instance.deleteReader.useMutation();

  const { mutateAsync: api_deleteManyReaders } =
    api.institution.instance.deleteManyReaders.useMutation();

  async function handleAddReader(data: NewReader) {
    const newReader: ReaderDTO = {
      id: data.institutionId,
      name: data.fullName,
      email: data.email,
      joined: false,
      workloadQuota: data.workloadQuota,
    };

    void toast
      .promise(api_addReader({ params, newReader }), {
        loading: "Adding reader...",
        success: `Successfully added reader ${newReader.id} to ${spacesLabels.instance.short}`,
        // todo: revisit error reporting method
        error: (err) =>
          err instanceof TRPCClientError
            ? err.message
            : `Failed to add reader to ${spacesLabels.instance.short}`,
      })
      .unwrap()
      .then(async () => {
        router.refresh();
        await refetch();
      });
  }

  async function handleAddReaders(
    readers: ReaderDTO[],
  ): Promise<LinkUserResult[]> {
    return await toast
      .promise(api_addManyReaders({ params, newReaders: readers }), {
        loading: `Adding ${readers.length} readers to ${spacesLabels.instance.short}...`,
        success: `Successfully added ${readers.length} readers to ${spacesLabels.instance.short}`,
        error: (err) =>
          err instanceof TRPCClientError
            ? err.message
            : `Failed to add readers to ${spacesLabels.instance.short}`,
      })
      .unwrap()
      .then(async (results) => {
        router.refresh();
        await refetch();
        return results;
      });
  }

  async function deleteReader(readerId: string) {
    void toast
      .promise(api_deleteReader({ params, readerId }), {
        loading: "Removing reader...",
        success: `Successfully removed reader ${readerId} from ${spacesLabels.instance.short}`,
        error: `Failed to remove reader from ${spacesLabels.instance.short}`,
      })
      .unwrap()
      .then(async () => {
        router.refresh();
        await refetch();
      });
  }

  async function deleteManyReaders(readerIds: string[]) {
    void toast
      .promise(api_deleteManyReaders({ params, readerIds }), {
        loading: "Removing readers...",
        success: `Successfully removed ${readerIds.length} readers from ${spacesLabels.instance.short}`,
        error: `Failed to remove readers from ${spacesLabels.instance.short}`,
      })
      .unwrap()
      .then(async () => {
        router.refresh();
        await refetch();
      });
  }

  function handleClearResults() {
    setProcessingResult(null);
    setShowErrorModal(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleShowModal() {
    setShowErrorModal(true);
  }

  const columns = useNewReaderColumns({ deleteReader, deleteManyReaders });

  return (
    <>
      <div className="mt-6 flex flex-col gap-6">
        <SectionHeading icon={FileSpreadsheetIcon} className="mb-2">
          Upload using CSV
        </SectionHeading>
        <div className="flex items-center gap-6">
          <CSVUploadButton
            requiredHeaders={addReadersCsvHeaders}
            handleUpload={handleAddReaders}
            processingResult={processingResult}
            showErrorModal={showErrorModal}
            onProcessingResultChange={setProcessingResult}
            onShowErrorModalChange={setShowErrorModal}
            fileInputRef={fileInputRef}
          />
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShowModal}
              disabled={!processingResult}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              View Upload Results
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearResults}
              disabled={!processingResult}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear & Upload New
            </Button>
          </div>
        </div>
        <CodeSnippet
          label="must contain header:"
          code={addReadersCsvHeaders.join(",")}
          copyMessage="CSV Headers"
        />
      </div>
      <LabelledSeparator label="or" className="my-6" />
      <FormSection handleAddReader={handleAddReader} />
      <Separator className="my-14" />

      {isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : (
        <DataTable columns={columns} data={data ?? []} />
      )}
    </>
  );
}
