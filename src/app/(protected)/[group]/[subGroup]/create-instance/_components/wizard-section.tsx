"use client";

import { toast } from "sonner";

import { spacesLabels } from "@/config/spaces";

import { type InstanceDTO } from "@/dto";

import { Stage } from "@/db/types";

import {
  InstanceWizard,
  type WizardFormData,
} from "@/components/instance-wizard/instance-wizard";

import { useAppRouter } from "@/lib/routing";
import { api } from "@/lib/trpc/client";
import { formatParamsAsPath } from "@/lib/utils/instance-params";
import { type SubGroupParams } from "@/lib/validations/params";

export function WizardSection({
  takenNames,
  params,
}: {
  takenNames: Set<string>;
  params: SubGroupParams;
}) {
  const router = useAppRouter();

  const { mutateAsync: createInstanceAsync } =
    api.institution.subGroup.createInstance.useMutation();

  async function handleSubmit(data: WizardFormData) {
    const newInstance = {
      ...params,
      displayName: data.displayName,
      maxReaderPreferences: data.maxReaderPreferences,
      maxStudentPreferences: data.maxStudentPreferences,
      maxStudentPreferencesPerSupervisor:
        data.maxStudentPreferencesPerSupervisor,
      minReaderPreferences: data.minReaderPreferences,
      minStudentPreferences: data.minStudentPreferences,
      projectSubmissionDeadline: data.projectSubmissionDeadline,
      readerPreferenceSubmissionDeadline:
        data.readerPreferenceSubmissionDeadline,
      studentPreferenceSubmissionDeadline:
        data.studentPreferenceSubmissionDeadline,
      stage: Stage.SETUP,
      supervisorAllocationAccess: false,
      studentAllocationAccess: false,
    } satisfies Omit<InstanceDTO, "instance">;

    void toast.promise(
      createInstanceAsync({
        params,
        newInstance,
        flags: data.flags,
        tags: data.tags,
      }).then(() => {
        router.push(
          "instance",
          { ...params, instance: encodeURIComponent(newInstance.displayName) },
          undefined,
        );
      }),
      {
        loading: `Creating ${spacesLabels.instance.full}...`,
        success: `${spacesLabels.instance.full} created successfully`,
        error: `Failed to create ${spacesLabels.instance.full}`,
      },
    );
  }

  return (
    <InstanceWizard
      onSubmit={handleSubmit}
      defaultValues={{
        displayName: "",
        flags: [],
        tags: [],
        maxReaderPreferences: 0,
        maxStudentPreferences: 0,
        maxStudentPreferencesPerSupervisor: 0,
        minReaderPreferences: 0,
        minStudentPreferences: 0,
        projectSubmissionDeadline: new Date(),
        readerPreferenceSubmissionDeadline: new Date(),
        studentPreferenceSubmissionDeadline: new Date(),
      }}
      takenNames={takenNames}
    />
  );
}
