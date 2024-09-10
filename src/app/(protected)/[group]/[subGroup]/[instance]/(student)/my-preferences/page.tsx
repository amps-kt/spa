import { Role, Stage } from "@prisma/client";

import { AccessControl } from "@/components/access-control";
import { Heading } from "@/components/heading";
import { LatestSubmissionDataTable } from "@/components/pages/student-preferences/latest-submission-data-table";
import { SubmissionArea } from "@/components/pages/student-preferences/submission-area";
import { PanelWrapper } from "@/components/panel-wrapper";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Unauthorised } from "@/components/unauthorised";

import { auth } from "@/lib/auth";
import { api } from "@/lib/trpc/server";
import { InstanceParams } from "@/lib/validations/params";
import { instanceTabs } from "@/lib/validations/tabs/instance";

import { CurrentBoardState } from "./_components/current-board-state";

import { app, metadataTitle } from "@/content/config/app";
import { pages } from "@/content/pages";

export async function generateMetadata({ params }: { params: InstanceParams }) {
  const { displayName } = await api.institution.instance.get({ params });

  return {
    title: metadataTitle([pages.myPreferences.title, displayName, app.name]),
  };
}

export default async function Page({ params }: { params: InstanceParams }) {
  const roles = await api.user.roles({ params });

  if (!roles.has(Role.STUDENT)) {
    return (
      <Unauthorised message="You need to be a Student to access this page" />
    );
  }

  const user = await auth();

  const preAllocatedTitle = await api.user.student.isPreAllocated({ params });
  if (preAllocatedTitle !== null) {
    return (
      <Unauthorised message="You have a self-defined project and may not submit any other preferences" />
    );
  }

  const { initialColumns, initialProjects } =
    await api.user.student.preference.initialBoardState({
      params,
      studentId: user.id,
    });

  const latestSubmissionDateTime = await api.user.student.latestSubmission({
    params,
    studentId: user.id,
  });

  const restrictions = await api.user.student.preferenceRestrictions({
    params,
  });

  return (
    <>
      <Heading>{instanceTabs.myPreferences.title}</Heading>
      <PanelWrapper className="mt-10 h-full">
        <AccessControl allowedStages={[Stage.PROJECT_SELECTION]}>
          <SubmissionArea
            title="Submit your preference list"
            studentId={user.id}
            initialProjects={initialProjects}
            latestSubmissionDateTime={latestSubmissionDateTime}
            restrictions={restrictions}
          />
        </AccessControl>
        <Tabs defaultValue="current-board-state" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger
              className="w-full data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
              value="current-board-state"
            >
              Working Board
            </TabsTrigger>
            <TabsTrigger
              className="w-full data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
              value="last-submission"
            >
              Latest Submission
            </TabsTrigger>
          </TabsList>
          <Separator className="my-4" />
          <TabsContent value="current-board-state">
            <div className="flex w-full max-w-7xl flex-col">
              <CurrentBoardState
                initialColumns={initialColumns}
                initialProjects={initialProjects}
              />
            </div>
          </TabsContent>
          <TabsContent value="last-submission">
            <LatestSubmissionDataTable studentId={user.id} />
          </TabsContent>
        </Tabs>
      </PanelWrapper>
    </>
  );
}
