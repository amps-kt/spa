"use client";

import { SendIcon } from "lucide-react";
import { toast } from "sonner";

import { type UserDTO } from "@/dto";

import { Button } from "@/components/ui/button";
import { YesNoAction } from "@/components/yes-no-action";

import { api } from "@/lib/trpc/client";
import { type InstanceParams } from "@/lib/validations/params";

export function NotifyLateMarkersButton({
  params,
  lateMarkers,
}: {
  params: InstanceParams;
  lateMarkers: UserDTO[];
}) {
  const { mutateAsync: api_notifyLateMarkers } =
    api.msp.admin.instance.notifyLateMarkers.useMutation();

  return (
    <YesNoAction
      title="Notify late markers"
      description={`You are about to email ${lateMarkers.length} markers to notify they have marking overdue. Do you wish to continue?`}
      trigger={
        <Button variant="outline">
          <SendIcon className="mr-2 h-4 w-4" /> Notify Late Markers
        </Button>
      }
      action={() =>
        toast.promise(api_notifyLateMarkers({ params }), {
          loading: "Sending emails",
          success: `Notifications successfully sent`,
          error: "Something went wrong",
        })
      }
    />
  );
}
