"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useInstanceParams } from "@/components/params-context";
import DataTable from "@/components/ui/data-table/data-table";
import { useDataTableProjectFilters } from "@/components/ui/data-table/data-table-context";

import { api } from "@/lib/trpc/client";

import {
  SupervisorProjectDto,
  useSupervisorProjectsColumns,
} from "./supervisor-projects-columns";

export function SupervisorProjectsDataTable({
  data,
}: {
  data: SupervisorProjectDto[];
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
        loading: `Deleting ${projectIds.length} Projects...`,
        error: "Something went wrong",
        success: `Successfully deleted ${projectIds.length} Projects`,
      },
    );
  }

  const filters = useDataTableProjectFilters();

  const columns = useSupervisorProjectsColumns({
    deleteProject: handleDelete,
    deleteSelectedProjects: handleDeleteSelected,
  });

  return (
    <DataTable
      className="w-full"
      searchableColumn={{ id: "Title", displayName: "Project Titles" }}
      columns={columns}
      filters={filters}
      data={data}
    />
  );
}
