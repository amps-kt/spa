"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { type PreferenceType } from "@/db/types";

import { KanbanBoard } from "@/components/kanban-board";
import { useBoardDetails } from "@/components/kanban-board/store";
import { useInstanceParams } from "@/components/params-context";

import { api } from "@/lib/trpc/client";

export function KanbanBoardSection({ studentId }: { studentId: string }) {
  const params = useInstanceParams();
  const router = useRouter();

  const deleteProject = useBoardDetails((s) => s.deleteProject);

  const utils = api.useUtils();

  const refetch = () =>
    utils.user.student.preference.initialBoardState.refetch();

  const { mutateAsync: api_reorderStudentPreference } =
    api.institution.instance.reorderStudentPreference.useMutation();

  const { mutateAsync: api_updateStudentPreference } =
    api.institution.instance.updateStudentPreference.useMutation();

  async function reorderPreference(
    projectId: string,
    updatedRank: number,
    preferenceType: PreferenceType,
  ) {
    void toast
      .promise(
        api_reorderStudentPreference({
          params,
          studentId,
          projectId,
          updatedRank,
          preferenceType,
        }),
        {
          loading: "Reordering...",
          success: "Successfully reordered preferences",
          error: "Something went wrong",
        },
      )
      .unwrap()
      .then(async () => {
        router.refresh();
        await refetch();
      });
  }

  async function deletePreference(projectId: string) {
    void toast
      .promise(
        api_updateStudentPreference({
          params,
          studentId,
          projectId,
          preferenceType: "None",
        }),
        {
          loading: `Removing project from preferences...`,
          success: `Successfully removed project from preferences`,
          error: "Something went wrong",
        },
      )
      .unwrap()
      .then(async () => {
        router.refresh();
        await refetch();
        deleteProject(projectId);
      });
  }

  return (
    <KanbanBoard
      reorderPreference={reorderPreference}
      deletePreference={deletePreference}
    />
  );
}
