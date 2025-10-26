"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  type FlagDTO,
  ProjectAllocationStatus,
  type TagDTO,
  type ProjectDTO,
  type StudentDTO,
} from "@/dto";

import { useInstanceParams } from "@/components/params-context";
import DataTable from "@/components/ui/data-table/data-table";

import { api } from "@/lib/trpc/client";
import { toPP3 } from "@/lib/utils/general/instance-params";

import { useSupervisorProjectsColumns } from "./supervisor-projects-columns";

export function SupervisorProjectsDataTable({
  data,
  projectDescriptors,
}: {
  data: { project: ProjectDTO; allocatedStudent?: StudentDTO }[];
  projectDescriptors: { flags: FlagDTO[]; tags: TagDTO[] };
}) {
  const params = useInstanceParams();
  const router = useRouter();

  const { mutateAsync: api_deleteProject } = api.project.delete.useMutation();
  const { mutateAsync: api_deleteManyProjects } =
    api.project.deleteMany.useMutation();

  async function deleteProject(projectId: string) {
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

  async function deleteManyProjects(projectIds: string[]) {
    void toast
      .promise(api_deleteManyProjects({ params, projectIds }), {
        loading: `Deleting ${projectIds.length} Projects...`,
        error: "Something went wrong",
        success: `Successfully deleted ${projectIds.length} Projects`,
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
    {
      title: "Allocation Status",
      columnId: "Student",
      options: [
        {
          id: ProjectAllocationStatus.ALGORITHMIC,
          displayName: "Algorithm Allocated",
        },
        {
          id: ProjectAllocationStatus.PRE_ALLOCATED,
          displayName: "Pre-allocated",
        },
        { id: ProjectAllocationStatus.UNALLOCATED, displayName: "Unallocated" },
      ],
    },
  ];

  const columns = useSupervisorProjectsColumns({
    deleteProject,
    deleteManyProjects,
  });

  return (
    <DataTable
      className="w-full"
      columns={columns}
      filters={filters}
      data={data}
    />
  );
}
