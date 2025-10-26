import { Clock10Icon, ListCheckIcon, ListTodoIcon } from "lucide-react";

import { PAGES } from "@/config/pages";

import { Stage } from "@/db/types";

import { DisplayDeadline } from "@/components/display-deadline";
import { SectionHeading } from "@/components/heading";
import { NothingToDo } from "@/components/nothing-to-do";
import { Calendar } from "@/components/ui/calendar";

import { AppInstanceLink } from "@/lib/routing";
import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

export async function ReaderHome({
  params,
  hasMultipleRoles,
}: {
  params: InstanceParams;
  hasMultipleRoles: boolean;
}) {
  return (
    <section className="flex flex-col gap-4">
      {hasMultipleRoles && (
        <SectionHeading className="text-muted-foreground -mb-6 text-xl">
          Reader Info
        </SectionHeading>
      )}
      <ReaderHomeInner params={params} />
    </section>
  );
}

async function ReaderHomeInner({ params }: { params: InstanceParams }) {
  const stage = await api.institution.instance.getCurrentStage({ params });

  if (stage === Stage.READER_BIDDING) {
    return <PreferenceSubmissionDeadline params={params} />;
  }

  if (stage === Stage.MARK_SUBMISSION) {
    return (
      <div className="mt-9 flex flex-col gap-4">
        <SectionHeading icon={ListCheckIcon} className="mb-2 flex items-center">
          Marking Allocations Released
        </SectionHeading>
        <p className="text-lg">
          Check the{" "}
          <AppInstanceLink
            className="text-indigo-600 hover:text-indigo-800"
            page="myMarking"
            linkArgs={{}}
          >
            {PAGES.myMarking.title}
          </AppInstanceLink>{" "}
          page to view the projects you have to mark
        </p>
      </div>
    );
  }

  return <NothingToDo />;
}

async function PreferenceSubmissionDeadline({
  params,
}: {
  params: InstanceParams;
}) {
  const { readerPreferenceSubmissionDeadline: deadline } =
    await api.institution.instance.get({ params });

  const { numPreferred, workloadQuota } = await api.user.reader.projectStats({
    params,
  });

  return (
    <div className="mt-9 flex justify-between">
      <div className="flex flex-col justify-start">
        <div className="flex flex-col gap-4">
          <SectionHeading icon={Clock10Icon} className="mb-2">
            Preference Submission Deadline
          </SectionHeading>
          <DisplayDeadline deadline={deadline} />
        </div>
        <div className="mt-16 flex flex-col gap-4">
          <SectionHeading icon={ListTodoIcon} className="mb-2">
            Task List
          </SectionHeading>
          <ul className="mx-6 list-disc [&>li]:mt-2">
            <li>
              <span className="font-semibold">Submit Preferences</span>
              <br />
              The system will try to allocate{" "}
              <span className="font-semibold">{workloadQuota}</span> projects to
              you.
              <br />
              To have the best chance of being allocated ones you like, we
              recommend submitting{" "}
              <span className="font-semibold">{2 * workloadQuota}</span>{" "}
              &quot;preferred&quot; preferences{" "}
              <span className="text-muted-foreground">
                (currently submitted: {numPreferred})
              </span>
            </li>
          </ul>
        </div>
      </div>
      <Calendar
        className="rounded-md border"
        mode="single"
        selected={deadline}
        defaultMonth={deadline}
      />
    </div>
  );
}
