import { type InstanceDTO } from "@/dto";

import { type ProjectPreferenceCardDto } from "@/lib/validations/board";

export function getSubmissionErrors(
  preferences: ProjectPreferenceCardDto[],
  instanceData: InstanceDTO,
) {
  const overSelected = computeOverSelected(
    preferences,
    instanceData.maxStudentPreferencesPerSupervisor,
  );

  return {
    isOver: preferences.length > instanceData.maxStudentPreferences,
    isUnder: preferences.length < instanceData.minStudentPreferences,
    hasOverSelectedSupervisor: overSelected.length > 0,
    overSelected,
  };
}

function computeOverSelected(
  preferenceList: ProjectPreferenceCardDto[],
  maxPerSupervisor: number,
) {
  const supervisorCounts = preferenceList.reduce(
    (acc, { supervisor }) => ({
      ...acc,
      [supervisor.id]: {
        count: (acc[supervisor.id]?.count ?? 0) + 1,
        name: supervisor.name,
      },
    }),
    {} as Record<string, { name: string; count: number }>,
  );

  const overSelected = Object.entries(supervisorCounts)
    .map(([id, rest]) => ({ id, ...rest }))
    .filter(({ count }) => count > maxPerSupervisor);

  return overSelected;
}
