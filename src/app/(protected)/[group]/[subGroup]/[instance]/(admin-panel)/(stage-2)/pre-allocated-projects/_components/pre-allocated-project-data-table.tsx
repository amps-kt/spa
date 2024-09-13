"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useInstanceParams } from "@/components/params-context";
import DataTable from "@/components/ui/data-table/data-table";
import { useDataTableProjectFilters } from "@/components/ui/data-table/data-table-context";

import { api } from "@/lib/trpc/client";
import { PreAllocatedProjectDto } from "@/lib/validations/dto/project";

import { usePreAllocatedProjectColumns } from "./pre-allocated-projects-columns";

export function PreAllocatedProjectDataTable({
  data,
}: {
  data: PreAllocatedProjectDto[];
}) {
  const params = useInstanceParams();
  const router = useRouter();

  const { mutateAsync: deleteAsync } = api.project.delete.useMutation();
  const { mutateAsync: deleteSelectedAsync } =
    api.project.deleteSelected.useMutation();

  async function handleDelete(projectId: string) {
    void toast.promise(
      deleteAsync({ params, projectId }).then(() => router.refresh()),
      {
        loading: "Deleting Project...",
        error: "Something went wrong",
        success: `Project ${projectId} deleted successfully`,
      },
    );
  }

  async function handleDeleteSelected(projectIds: string[]) {
    void toast.promise(
      deleteSelectedAsync({ params, projectIds }).then(() => router.refresh()),
      {
        loading: "Deleting Project...",
        error: "Something went wrong",
        success: `All Projects deleted successfully`,
      },
    );
  }

  const filters = useDataTableProjectFilters();

  const columns = usePreAllocatedProjectColumns({
    deleteProject: handleDelete,
    deleteSelectedProjects: handleDeleteSelected,
  });

  return (
    <DataTable
      searchableColumn={{ id: "Project Title", displayName: "Project Titles" }}
      columns={columns}
      filters={filters}
      data={data}
    />
  );
}
