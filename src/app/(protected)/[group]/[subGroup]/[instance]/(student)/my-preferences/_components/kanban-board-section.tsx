"use client";
import { PreferenceType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { KanbanBoard } from "@/components/kanban-board";
import { useBoardDetails } from "@/components/kanban-board/store";
import { useInstanceParams } from "@/components/params-context";

import { api } from "@/lib/trpc/client";

export function KanbanBoardSection() {
  const params = useInstanceParams();
  const router = useRouter();

  const utils = api.useUtils();

  const refetch = () =>
    utils.user.student.preference.initialBoardState.refetch();

  const deleteProject = useBoardDetails((s) => s.deleteProject);

  const { mutateAsync: reorderAsync } =
    api.user.student.preference.reorder.useMutation();

  const { mutateAsync: updatePreferenceAsync } =
    api.user.student.preference.update.useMutation();

  async function reorderPreference(
    projectId: string,
    updatedRank: number,
    preferenceType: PreferenceType,
  ) {
    void toast.promise(
      reorderAsync({ params, projectId, updatedRank, preferenceType }).then(
        () => {
          router.refresh();
          refetch();
        },
      ),
      {
        loading: "Reordering...",
        error: "Something went wrong",
        success: "Successfully reordered preferences",
      },
    );
  }

  async function deletePreference(projectId: string) {
    void toast.promise(
      updatePreferenceAsync({ params, projectId, preferenceType: "None" }).then(
        () => {
          router.refresh();
          refetch();
          deleteProject(projectId);
        },
      ),
      {
        loading: `Removing project from preferences...`,
        error: "Something went wrong",
        success: `Successfully removed project from preferences`,
      },
    );
  }

  return (
    <KanbanBoard
      reorderPreference={reorderPreference}
      deletePreference={deletePreference}
    />
  );
}
