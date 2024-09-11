import { PreferenceType } from "@prisma/client";

export type Id = string;

export type ProjectPreferenceCardDto = {
  id: Id;
  columnId: PreferenceType;
  title: string;
  rank: number;
  supervisor: { id: string; name: string };
};

export type PreferenceBoard = Record<
  PreferenceType,
  ProjectPreferenceCardDto[]
>;

export const PREFERENCE_BOARD_COLUMNS = [
  { id: PreferenceType.PREFERENCE, displayName: "Preference List" },
  { id: PreferenceType.SHORTLIST, displayName: "Shortlist" },
];

export const PROJECT_PREFERENCE_CARD = "PROJECT_PREFERENCE_CARD";

export const PROJECT_PREFERENCE_COLUMN = "PROJECT_PREFERENCE_COLUMN";
