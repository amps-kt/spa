import { Clock10Icon, ListTodoIcon, ListCheckIcon } from "lucide-react";

import { PAGES } from "@/config/pages";

import { Stage } from "@/db/types";

import { DisplayDeadline } from "@/components/display-deadline";
import { SectionHeading } from "@/components/heading";
import { InstanceLink } from "@/components/instance-link";
import { NothingToDo } from "@/components/nothing-to-do";
import { Calendar } from "@/components/ui/calendar";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

export function SupervisorHome({
  hasMultipleRoles,
  params,
}: {
  hasMultipleRoles: boolean;
  params: InstanceParams;
}) {
  return (
    <section className="flex flex-col gap-4">
      {hasMultipleRoles && (
        <SectionHeading className="text-muted-foreground -mb-6 text-xl">
          Supervisor Info
        </SectionHeading>
      )}
      <SupervisorHomeInner params={params} />
    </section>
  );
}

async function SupervisorHomeInner({ params }: { params: InstanceParams }) {
  const stage = await api.institution.instance.getCurrentStage({ params });

  if (stage === Stage.PROJECT_SUBMISSION) {
    return <ProjectSubmissionDeadline params={params} />;
  }

  if (
    stage === Stage.ALLOCATION_PUBLICATION &&
    (await api.institution.instance.get({ params })).supervisorAllocationAccess
  ) {
    return (
      <div className="mt-9 flex flex-col gap-4">
        <SectionHeading icon={ListCheckIcon} className="mb-2">
          Allocations Released
        </SectionHeading>
        <p className="text-lg">
          Check the{" "}
          <InstanceLink href={PAGES.mySupervisions.href}>
            {PAGES.mySupervisions.title}
          </InstanceLink>{" "}
          page to view your allocated projects
        </p>
      </div>
    );
  }

  if (stage === Stage.MARK_SUBMISSION) {
    return (
      <div className="mt-9 flex flex-col gap-4">
        <SectionHeading icon={ListCheckIcon} className="mb-2 flex items-center">
          Marking Allocations Released
        </SectionHeading>
        <p className="text-lg">
          Check the{" "}
          <InstanceLink href={PAGES.myMarking.href}>
            {PAGES.myMarking.title}
          </InstanceLink>{" "}
          page to view the projects you have to mark
        </p>
      </div>
    );
  }

  return <NothingToDo />;
}

async function ProjectSubmissionDeadline({
  params,
}: {
  params: InstanceParams;
}) {
  const { projectSubmissionDeadline: deadline } =
    await api.institution.instance.get({ params });

  const { currentSubmissionCount, submissionTarget } =
    await api.user.supervisor.projectStats({ params });

  return (
    <div className="mt-9 flex justify-between">
      <div className="flex flex-col justify-start">
        <div className="flex flex-col gap-4">
          <SectionHeading icon={Clock10Icon} className="mb-2">
            Project Upload Deadline
          </SectionHeading>
          <DisplayDeadline deadline={deadline} />
        </div>
        <div className="mt-16 flex flex-col gap-4">
          <SectionHeading icon={ListTodoIcon} className="mb-2">
            Task List
          </SectionHeading>
          <ul className="ml-6 list-disc [&>li]:mt-2">
            {submissionTarget > 0 && (
              <li>
                Submit {submissionTarget} projects{" "}
                <span className="text-muted-foreground">
                  (currently submitted: {currentSubmissionCount})
                </span>
              </li>
            )}
            <li>Submit any self-defined projects</li>
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
