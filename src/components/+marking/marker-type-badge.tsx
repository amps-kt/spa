import { type MarkerType } from "@/db/types";

const markerTypeData: Record<MarkerType, { displayName: string }> = {
  READER: { displayName: "Reader" },
  SUPERVISOR: { displayName: "Supervisor" },
};

export function MarkerTypeBadge({ markerType }: { markerType: MarkerType }) {
  return <p>{markerTypeData[markerType].displayName}</p>;
}
