"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { spacesLabels } from "@/config/spaces";

import { type ReaderDTO } from "@/dto";

import { type Role } from "@/db/types";

import { useInstanceParams } from "@/components/params-context";
import DataTable from "@/components/ui/data-table/data-table";

import { api } from "@/lib/trpc/client";

import { useAllReadersColumns } from "./all-readers-columns";

export function ReadersDataTable({
  roles,
  data,
}: {
  roles: Set<Role>;
  data: ReaderDTO[];
}) {
  const params = useInstanceParams();
  const router = useRouter();

  const { mutateAsync: api_deleteAsync } =
    api.institution.instance.deleteReader.useMutation();

  const { mutateAsync: api_deleteManyAsync } =
    api.institution.instance.deleteManyReaders.useMutation();

  async function deleteReader(readerId: string) {
    void toast
      .promise(api_deleteAsync({ params, readerId }), {
        loading: `Removing Reader ${readerId} from ${spacesLabels.instance.short}...`,
        success: `Reader ${readerId} deleted successfully`,
        error: `Failed to remove reader ${readerId} from ${spacesLabels.instance.short}`,
      })
      .unwrap()
      .then(() => {
        router.refresh();
      });
  }

  async function deleteSelectedReaders(readerIds: string[]) {
    void toast
      .promise(api_deleteManyAsync({ params, readerIds }), {
        loading: `Removing ${readerIds.length} readers from ${spacesLabels.instance.short}...`,
        success: `Successfully removed ${readerIds.length} Readers from ${spacesLabels.instance.short}`,
        error: `Failed to remove readers from ${spacesLabels.instance.short}`,
      })
      .unwrap()
      .then(() => {
        router.refresh();
      });
  }

  const columns = useAllReadersColumns({
    roles,
    deleteReader,
    deleteSelectedReaders,
  });

  return <DataTable className="w-full" columns={columns} data={data} />;
}
