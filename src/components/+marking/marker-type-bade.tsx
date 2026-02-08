import { type MarkerType } from "@prisma/client";

const markerTypeData: Record<MarkerType, { displayName: string }> = {
  READER: { displayName: "Reader" },
  SUPERVISOR: { displayName: "Supervisor" },
};

export function MarkerTypeBade({ markerType }: { markerType: MarkerType }) {
  return <p>{markerTypeData[markerType].displayName}</p>;
}
