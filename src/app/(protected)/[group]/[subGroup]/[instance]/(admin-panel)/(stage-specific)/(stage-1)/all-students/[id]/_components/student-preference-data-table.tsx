"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useInstanceParams } from "@/components/params-context";
import DataTable from "@/components/ui/data-table/data-table";

import { api } from "@/lib/trpc/client";
import { type StudentPreferenceType } from "@/lib/validations/student-preference";

import {
  type PreferenceData,
  useStudentPreferencesColumns,
} from "./student-preference-columns";

export function StudentPreferenceDataTable({
  data,
  studentId,
}: {
  data: PreferenceData[];
  studentId: string;
}) {
  const params = useInstanceParams();
  const router = useRouter();

  const { mutateAsync: api_changeStudentPreference } =
    api.institution.instance.changeStudentPreference.useMutation();

  const { mutateAsync: api_changeManyStudentPreferences } =
    api.institution.instance.changeManyStudentPreferences.useMutation();

  async function changePreference(
    newPreferenceType: StudentPreferenceType,
    projectId: string,
  ) {
    void toast
      .promise(
        api_changeStudentPreference({
          params,
          newPreferenceType,
          projectId,
          studentId,
        }),
        {
          loading: "Updating project preference...",
          success: `Project ${projectId} preference updated successfully`,
          error: "Something went wrong",
        },
      )
      .unwrap()
      .then(() => router.refresh());
  }

  async function changeMultiplePreferences(
    newPreferenceType: StudentPreferenceType,
    projectIds: string[],
  ) {
    void toast
      .promise(
        api_changeManyStudentPreferences({
          params,
          newPreferenceType,
          studentId,
          projectIds,
        }),
        {
          loading: "Updating all project preferences...",
          success: `Successfully updated ${projectIds.length} project preferences`,
          error: "Something went wrong",
        },
      )
      .unwrap()
      .then(() => router.refresh());
  }

  const columns = useStudentPreferencesColumns({
    changePreference,
    changeMultiplePreferences,
  });

  return <DataTable className="w-full" columns={columns} data={data} />;
}
