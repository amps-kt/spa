"use client";

import { SendIcon } from "lucide-react";
import { toast } from "sonner";

import { type LateBlame, type UserDTO } from "@/dto";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { YesNoAction } from "@/components/yes-no-action";

import { api } from "@/lib/trpc/client";
import { type InstanceParams } from "@/lib/validations/params";

export function NotifyLateMarkersButton({
  params,
  lateMarkers,
}: {
  params: InstanceParams;
  lateMarkers: { marker: UserDTO; blame: LateBlame[] }[];
}) {
  const { mutateAsync: api_notifyLateMarkers } =
    api.msp.admin.instance.notifyLateMarkers.useMutation();

  return (
    <YesNoAction
      title="Notify late markers"
      description={
        <div>
          <p>
            This will send a single email to any marker who has any overdue unit
            of assessment as of now.
            <br />
            This will email {lateMarkers.length} markers. Do you wish to
            continue?
          </p>

          <p className="my-2 text-primary">
            A breakdown of the markers you are about to email, and why, is
            below:
          </p>

          <ScrollArea className="h-[40dvh] text-accent-foreground pr-2 bg-accent rounded-md my-2">
            <ol>
              {lateMarkers.map((m) => (
                <div key={m.marker.id} className="m-2">
                  <div className="text-lg">{m.marker.name}</div>
                  <ol className="list-disc">
                    {m.blame.map((b, i) => (
                      <li
                        key={i}
                        className="flex flex-row justify-between ml-2"
                      >
                        <p>{b.student.name}</p>
                        <p>{b.unit.title}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </ol>
          </ScrollArea>
        </div>
      }
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
