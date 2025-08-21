"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { type FlagDTO, type TagDTO, type ProjectDTO } from "@/dto";

import { useInstanceParams } from "@/components/params-context";
import DataTable from "@/components/ui/data-table/data-table";

import { api } from "@/lib/trpc/client";
import { toPP3 } from "@/lib/utils/general/instance-params";

import { useLateProjectColumns } from "./late-projects-columns";

export function LateProjectDataTable({
  data,
  projectDescriptors,
}: {
  data: ProjectDTO[];
  projectDescriptors: { flags: FlagDTO[]; tags: TagDTO[] };
}) {
  const params = useInstanceParams();
  const router = useRouter();

  const { mutateAsync: api_deleteProject } = api.project.delete.useMutation();
  const { mutateAsync: api_deleteManyProjects } =
    api.project.deleteMany.useMutation();

  async function handleDelete(projectId: string) {
    void toast
      .promise(api_deleteProject({ params: toPP3(params, projectId) }), {
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

  const filters = [
    {
      title: "Flags",
      columnId: "Flags",
      options: projectDescriptors.flags.map((flag) => ({
        id: flag.id,
        displayName: flag.displayName,
      })),
    },
    {
      title: "Keywords",
      columnId: "Keywords",
      options: projectDescriptors.tags.map((tag) => ({
        id: tag.id,
        displayName: tag.title,
      })),
    },
  ];

  const columns = useLateProjectColumns({
    deleteProject: handleDelete,
    deleteSelectedProjects: handleDeleteSelected,
  });

  return <DataTable columns={columns} filters={filters} data={data} />;
}
