import { Clock10Icon, ListCheckIcon, ListTodoIcon } from "lucide-react";
import Link from "next/link";

import { PAGES } from "@/config/pages";

import { Stage } from "@/db/types";

import { DisplayDeadline } from "@/components/display-deadline";
import { SectionHeading } from "@/components/heading";
import { InstanceLink } from "@/components/instance-link";
import { NothingToDo } from "@/components/nothing-to-do";
import { buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import { api } from "@/lib/trpc/server";
import { cn } from "@/lib/utils";
import { formatParamsAsPath } from "@/lib/utils/general/get-instance-path";
import { type InstanceParams } from "@/lib/validations/params";

export async function StudentHome({ params }: { params: InstanceParams }) {
  const stage = await api.institution.instance.getCurrentStage({ params });

  if (stage === Stage.STUDENT_BIDDING) {
    const isPreAllocated = await api.user.student.isPreAllocated({ params });
    if (isPreAllocated) return <PreAllocatedInfoSection params={params} />;
    return <PreferenceSubmissionInfoSection params={params} />;
  }

  if (stage === Stage.ALLOCATION_PUBLICATION) {
    {
      if (await api.institution.instance.getStudentAllocationAccess({ params }))
        return (
          <div className="mt-9 flex flex-col gap-4">
            <SectionHeading icon={ListCheckIcon} className="mb-2">
              Allocations Released
            </SectionHeading>

            <p className="text-lg">
              Check the{" "}
              <InstanceLink href={PAGES.myAllocation.href}>
                {PAGES.myAllocation.title}
              </InstanceLink>{" "}
              page to view your allocated project
            </p>
          </div>
        );
    }

    return <NothingToDo />;
  }
}

async function PreferenceSubmissionInfoSection({
  params,
}: {
  params: InstanceParams;
}) {
  const { studentPreferenceSubmissionDeadline: deadline } =
    await api.institution.instance.get({ params });

  const {
    minStudentPreferences: minPreferences,
    maxStudentPreferences: maxPreferences,
  } = await api.institution.instance.get({ params });

  return (
    <div className="mt-9 flex justify-between">
      <div className="flex flex-col justify-start">
        <div className="flex flex-col gap-4">
          <SectionHeading icon={Clock10Icon} className="mb-2">
            Preference List Submission Deadline
          </SectionHeading>
          <DisplayDeadline deadline={deadline} />
        </div>
        <div className="mt-16 flex flex-col gap-4">
          <SectionHeading className="mb-2 flex items-center">
            <ListTodoIcon className="mr-2 h-6 w-6 text-indigo-500" />
            <span>Task List</span>
          </SectionHeading>
          <ul className="ml-6 list-disc [&>li]:mt-2">
            <li>
              Submit your preference list{" "}
              <span className="text-muted-foreground">
                (between {minPreferences} and {maxPreferences} inclusive)
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

async function PreAllocatedInfoSection({ params }: { params: InstanceParams }) {
  const { studentPreferenceSubmissionDeadline: deadline } =
    await api.institution.instance.get({ params });

  const { project } = await api.user.student.getAllocation({ params });

  const instancePath = formatParamsAsPath(params);

  return (
    <div className="mt-9 flex justify-between">
      <div className="flex flex-col justify-start">
        <div className="flex flex-col gap-4">
          <SectionHeading icon={ListTodoIcon} className="mb-2">
            Task List
          </SectionHeading>
          <p>
            You are allocated to your self-defined project and do not need to
            submit preferences.
          </p>
          <p className="flex items-center justify-start gap-2">
            View your project:
            <Link
              href={`${instancePath}/projects/${project.id}`}
              className={cn(buttonVariants({ variant: "link" }), "text-base")}
            >
              {project.title}
            </Link>
          </p>
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
