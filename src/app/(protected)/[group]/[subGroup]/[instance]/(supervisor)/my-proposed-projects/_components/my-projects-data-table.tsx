"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useInstanceParams } from "@/components/params-context";
import DataTable from "@/components/ui/data-table/data-table";

import { api } from "@/lib/trpc/client";

import {
  type SupervisorProjectDataDto,
  useMyProjectColumns,
} from "./my-projects-columns";

export function MyProjectsDataTable({
  projects,
}: {
  projects: SupervisorProjectDataDto[];
}) {
  const params = useInstanceParams();
  const router = useRouter();

  const { mutateAsync: api_deleteProject } = api.project.delete.useMutation();
  const { mutateAsync: api_deleteManyProjects } =
    api.project.deleteMany.useMutation();

  async function handleDelete(projectId: string) {
    void toast
      .promise(api_deleteProject({ params: { ...params, projectId } }), {
        loading: "Deleting Project...",
        error: "Something went wrong",
        // [#14532d] use title instead of ID
        success: `Project ${projectId} deleted successfully`,
      })
      .unwrap()
      .then(() => router.refresh());
  }

  async function handleDeleteSelected(projectIds: string[]) {
    void toast
      .promise(api_deleteManyProjects({ params, projectIds }), {
        loading: "Deleting Project...",
        error: "Something went wrong",
        success: `All Projects deleted successfully`,
      })
      .unwrap()
      .then(() => router.refresh());
  }

  const columns = useMyProjectColumns({
    deleteProject: handleDelete,
    deleteSelectedProjects: handleDeleteSelected,
  });

  return <DataTable className="w-full" columns={columns} data={projects} />;
}
