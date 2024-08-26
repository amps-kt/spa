import { BookmarkPlusIcon } from "lucide-react";

import { SubHeading } from "@/components/heading";
import { StudentSavedPreferenceDataTable } from "@/components/student-saved-preferences/data-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { api } from "@/lib/trpc/server";
import { cn } from "@/lib/utils";
import { PageParams } from "@/lib/validations/params";

import { StudentPreferenceDataTable } from "./student-preference-data-table";

export async function StudentPreferencesSection({
  params,
}: {
  params: PageParams;
}) {
  const studentId = params.id;

  const currentBoardState = await api.user.student.preference.getAll({
    params,
    studentId,
  });

  const lastSubmission = await api.user.student.preference.getAllSaved({
    params,
    studentId,
  });

  return (
    <>
      <div className="-mb-2 mt-6 flex items-center justify-between">
        <SubHeading>Preferences</SubHeading>
        <Button
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "flex items-center justify-center gap-2 text-nowrap",
          )}
        >
          <BookmarkPlusIcon className="h-4 w-4" />
          <p>Add Project to Preferences</p>
        </Button>
      </div>

      <Tabs defaultValue="current-board-state" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger
            className="w-full data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
            value="current-board-state"
          >
            Current Board State
          </TabsTrigger>
          <TabsTrigger
            className="w-full data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
            value="last-submission"
          >
            Last Submission
          </TabsTrigger>
        </TabsList>
        <Separator className="my-4" />
        <TabsContent value="current-board-state">
          <StudentPreferenceDataTable
            data={currentBoardState}
            studentId={studentId}
          />
        </TabsContent>
        <TabsContent value="last-submission">
          <StudentSavedPreferenceDataTable data={lastSubmission} />
        </TabsContent>
      </Tabs>
    </>
  );
}
