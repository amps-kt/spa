"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PAGES } from "@/config/pages";

import { type ProjectDTO } from "@/dto";

import { PreferenceType } from "@/db/types";

import { MyPreferencesButton } from "@/components/my-preferences-button";
import {
  useInstanceParams,
  usePathInInstance,
} from "@/components/params-context";
import { ToastSuccessCard } from "@/components/toast-success-card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { api } from "@/lib/trpc/client";
import {
  studentPreferenceSchema,
  type StudentPreferenceType,
} from "@/lib/validations/student-preference";

export function StudentPreferenceButton({
  project,
  defaultStatus,
}: {
  project: ProjectDTO;
  defaultStatus: StudentPreferenceType;
}) {
  const router = useRouter();
  const params = useInstanceParams();
  const { getPath } = usePathInInstance();

  const [selectStatus, setSelectStatus] =
    useState<StudentPreferenceType>(defaultStatus);

  const { mutateAsync: updateAsync } =
    api.user.student.preference.update.useMutation();

  async function handleChange(preferenceType: StudentPreferenceType) {
    void toast
      .promise(updateAsync({ params, projectId: project.id, preferenceType }), {
        loading: `Updating preference for Project (${project.title})...`,
        success: (
          <ToastSuccessCard
            message="Successfully updated project preference"
            action={
              <MyPreferencesButton href={getPath(PAGES.myPreferences.href)} />
            }
          />
        ),
        error: "Something went wrong",
      })
      .unwrap()
      .then(() => {
        router.refresh();
        setSelectStatus(preferenceType);
      });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="min-w-32 text-nowrap">
          {selectStatus === PreferenceType.PREFERENCE
            ? "In Preferences"
            : selectStatus === PreferenceType.SHORTLIST
              ? "In Shortlist"
              : "Select"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Save Project in:</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={selectStatus}
          onValueChange={async (value) => {
            const preferenceChange = studentPreferenceSchema.parse(value);
            await handleChange(preferenceChange);
          }}
        >
          <DropdownMenuRadioItem value="None">None</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={PreferenceType.SHORTLIST}>
            Shortlist
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={PreferenceType.PREFERENCE}>
            Preference
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
