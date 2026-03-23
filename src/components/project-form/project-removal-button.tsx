"use client";

import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { PAGES } from "@/config/pages";

import { useInstanceParams } from "@/components/params-context";
import { Button } from "@/components/ui/button";

import { useAppInstanceRouter } from "@/lib/routing";
import { api } from "@/lib/trpc/client";
import { toPP3 } from "@/lib/utils/instance-params";

export function ProjectRemovalButton({
  projectId,
  isAdmin,
}: {
  projectId: string;
  isAdmin: boolean;
}) {
  const params = useInstanceParams();
  const router = useAppInstanceRouter();

  const { mutateAsync: api_deleteProject } = api.project.delete.useMutation();

  function handleDelete() {
    void toast
      .promise(api_deleteProject({ params: toPP3(params, projectId) }), {
        // [#14532d] use title to reference project being deleted
        loading: "Deleting Project...",
        error: "Something went wrong",
        success: "Success",
      })
      .unwrap()
      .then(() => {
        if (isAdmin) {
          router.push("allProjects", {}, undefined);
        } else {
          router.push("myProposedProjects", {}, undefined);
        }

        router.refresh();
      });
  }
  return (
    <Button
      className="flex items-center gap-2"
      variant="destructive"
      size="lg"
      onClick={handleDelete}
      type="button"
    >
      <Trash2Icon className="h-4 w-4" />
      <p>Delete Project</p>
    </Button>
  );
}
