"use client";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { YesNoAction } from "@/components/yes-no-action";

import { api } from "@/lib/trpc/client";
import { SubGroupParams } from "@/lib/validations/params";

import { spacesLabels } from "@/content/spaces";

export function AdminRemovalButton({
  params,
  userId,
}: {
  params: SubGroupParams;
  userId: string;
}) {
  const router = useRouter();

  const { mutateAsync } = api.institution.subGroup.removeAdmin.useMutation();

  function handleRemoval() {
    void toast.promise(
      mutateAsync({ params, userId }).then(() => router.refresh()),
      {
        loading: `Removing ${spacesLabels.subGroup.short} admin...`,
        error: "Something went wrong",
        success: `Successfully removed ${spacesLabels.subGroup.short} admin`,
      },
    );
  }

  return (
    <YesNoAction
      action={handleRemoval}
      title={`Remove ${spacesLabels.subGroup.short} Admin?`}
      description={`You are about to remove a ${spacesLabels.subGroup.short} admin. Do you wish to proceed?`}
      trigger={
        <Button variant="destructive" className="flex items-center gap-2">
          <Trash2Icon className="h-4 w-4" />
          <p>remove</p>
        </Button>
      }
    />
  );
}
