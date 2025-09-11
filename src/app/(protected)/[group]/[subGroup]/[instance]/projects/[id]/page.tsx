import {
  BookmarkIcon,
  FlagIcon,
  FolderCheckIcon,
  TagIcon,
  TextIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { app, metadataTitle } from "@/config/meta";
import { PAGES } from "@/config/pages";

import { type ProjectDTO, type StudentDTO, type SupervisorDTO } from "@/dto";

import { Role, Stage } from "@/db/types";

import { ServerSideConditionalRender } from "@/components/access-control/server-side-conditional-render";
import { Heading, SectionHeading } from "@/components/heading";
import { MarkdownRenderer } from "@/components/markdown-editor";
import { PanelWrapper } from "@/components/panel-wrapper";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { api } from "@/lib/trpc/server";
import { cn } from "@/lib/utils";
import { formatParamsAsPath } from "@/lib/utils/general/get-instance-path";
import { toPP1, toPP4 } from "@/lib/utils/general/instance-params";
import { toPositional } from "@/lib/utils/general/to-positional";
import { forbidden } from "@/lib/utils/redirect";
import { type InstanceParams } from "@/lib/validations/params";

import { EditButton } from "./_components/edit-button";
import { StudentPreferenceButton } from "./_components/student-preference-button";
import { StudentPreferenceDataTable } from "./_components/student-preference-data-table";

type PageParams = InstanceParams & { id: string };

export async function generateMetadata({ params }: { params: PageParams }) {
  const exists = await api.project.exists({ params: toPP1(params) });
  if (!exists) notFound();

  const { displayName } = await api.institution.instance.get({ params });
  const { title } = await api.project.getById({
    params: { ...params, projectId: params.id },
  });

  return {
    title: metadataTitle([
      title,
      PAGES.allProjects.title,
      displayName,
      app.name,
    ]),
  };
}

export default async function Project({ params }: { params: PageParams }) {
  const exists = await api.project.exists({ params: toPP1(params) });
  if (!exists) notFound();

  const userAccess = await api.ac.hasProjectAccess({ params: toPP1(params) });
  if (!userAccess.access) forbidden({ next: formatParamsAsPath(params) });

  const { project, supervisor } = await api.project.getByIdWithSupervisor({
    params: toPP1(params),
  });

  const user = await api.user.get();
  const roles = await api.user.roles({ params });

  const isAdmin = roles.has(Role.ADMIN);
  const isStudent = roles.has(Role.STUDENT);
  const isProjectSupervisor = project.supervisorId === user.id;

  return (
    <PanelWrapper>
      <Heading className="flex items-center justify-between gap-2 text-3xl">
        {project.title}
        <Controls
          params={params}
          project={project}
          isProjectSupervisor={isProjectSupervisor}
          isStudent={isStudent}
        />
      </Heading>

      <div className="mt-6 flex gap-6">
        <div className="flex w-3/4 flex-col gap-16">
          <section className="flex flex-col">
            <SectionHeading className="mb-2 flex items-center">
              <TextIcon className="mr-2 h-6 w-6 text-indigo-500" />
              <span>Description</span>
            </SectionHeading>
            <div className="mt-6">
              <MarkdownRenderer source={project.description} />
            </div>
          </section>
        </div>
        <div className="w-1/4">
          <ProjectDetailsCard
            projectData={{ project, supervisor }}
            isAdmin={isAdmin}
          />
        </div>
      </div>

      <ServerSideConditionalRender
        params={params}
        allowedRoles={[Role.ADMIN]}
        overrides={{ roles: { OR: isProjectSupervisor } }}
        allowed={<StudentInformationSection params={params} />}
      />
    </PanelWrapper>
  );
}

async function Controls({
  params,
  project,
  isProjectSupervisor,
  isStudent,
}: {
  params: PageParams;
  project: ProjectDTO;
  isProjectSupervisor: boolean;
  isStudent: boolean;
}) {
  const isPreAllocated =
    isStudent && (await api.user.student.isPreAllocated({ params }));

  const preferenceStatus = isStudent
    ? await api.user.student.preference.getForProject(toPP4(params))
    : "None";

  return (
    <>
      <ServerSideConditionalRender
        params={params}
        allowedRoles={[Role.STUDENT]}
        allowedStages={[Stage.STUDENT_BIDDING]}
        overrides={{ roles: { AND: !isPreAllocated } }}
        allowed={
          <StudentPreferenceButton
            project={project}
            defaultStatus={preferenceStatus}
          />
        }
      />
      <ServerSideConditionalRender
        params={params}
        allowedRoles={[Role.ADMIN]}
        overrides={{ roles: { OR: isProjectSupervisor } }}
        allowed={<EditButton project={project} />}
      />
    </>
  );
}

async function ProjectDetailsCard({
  isAdmin,
  projectData,
}: {
  isAdmin: boolean;
  projectData: { project: ProjectDTO; supervisor: SupervisorDTO };
}) {
  return (
    <Card className="w-full max-w-sm">
      <CardContent className="flex flex-col gap-10 pt-5">
        <div className="flex items-center space-x-4">
          <UserIcon className="h-6 w-6 text-blue-500" />
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Supervisor
            </h3>
            {isAdmin ? (
              <Link
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "p-0 text-lg",
                )}
                href={`../${PAGES.allSupervisors.href}/${projectData.supervisor.id}`}
              >
                {projectData.supervisor.name}
              </Link>
            ) : (
              <p className="text-lg font-semibold">
                {projectData.supervisor.name}
              </p>
            )}
          </div>
        </div>
        <div className={cn(projectData.project.flags.length === 0 && "hidden")}>
          <div className="mb-2 flex items-center space-x-4">
            <FlagIcon className="h-6 w-6 text-fuchsia-500" />
            <h3 className="text-sm font-medium text-muted-foreground">Flags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {projectData.project.flags.map((flag, i) => (
              <Badge className="rounded-md" variant="accent" key={i}>
                {flag.displayName}
              </Badge>
            ))}
          </div>
        </div>
        <div className={cn(projectData.project.tags.length === 0 && "hidden")}>
          <div className="mb-2 flex items-center space-x-4">
            <TagIcon className="h-6 w-6 text-purple-500" />
            <h3 className="text-sm font-medium text-muted-foreground">
              Keywords
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {projectData.project.tags.map((tag, i) => (
              <Badge className="w-max" key={i} variant="outline">
                {tag.title}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function StudentInformationSection({ params }: { params: PageParams }) {
  const allocation = await api.project.getAllocation({ params: toPP1(params) });

  const isPreAllocated = allocation?.isPreAllocated ?? false;

  return (
    <>
      {allocation && <AllocatedStudentSection allocation={allocation} />}
      {allocation && !isPreAllocated && <Separator />}
      {!isPreAllocated && <StudentPreferenceSection params={params} />}
    </>
  );
}

function AllocatedStudentSection({
  allocation: { student, rank, isPreAllocated },
}: {
  allocation: { student: StudentDTO; rank: number; isPreAllocated: boolean };
}) {
  return (
    <section className={cn("mt-16 flex flex-col gap-8")}>
      <SectionHeading icon={FolderCheckIcon}>Allocation</SectionHeading>
      <div className="flex items-center gap-2">
        <Card className="w-fit max-w-sm border-none bg-accent px-6 py-3">
          <CardContent className="flex flex-col p-0">
            <div className="flex items-center space-x-4">
              <UserIcon className="h-6 w-6 flex-none text-blue-500" />
              <div className="flex flex-col">
                <h3 className="-mb-1 text-sm font-medium text-muted-foreground">
                  Student
                </h3>
                <Link
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    "text-nowrap p-0 text-base",
                  )}
                  href={`../${PAGES.allStudents.href}/${student.id}`}
                >
                  {student.name}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        {isPreAllocated ? (
          <p>The student self-defined this project.</p>
        ) : (
          <p>
            This was the student&apos;s{" "}
            <span className="font-semibold text-indigo-600">
              {toPositional(rank)}
            </span>{" "}
            choice.
          </p>
        )}
      </div>
    </section>
  );
}

async function StudentPreferenceSection({ params }: { params: PageParams }) {
  const studentPreferences = await api.project.getStudentPreferencesForProject({
    params: toPP1(params),
  });

  const projectDescriptors =
    await api.institution.instance.getAllProjectDescriptors({ params });

  return (
    <section className="mt-16 flex flex-col gap-8">
      <SectionHeading icon={BookmarkIcon}>Student Preferences</SectionHeading>
      <StudentPreferenceDataTable
        data={studentPreferences}
        projectDescriptors={projectDescriptors}
      />
    </section>
  );
}
