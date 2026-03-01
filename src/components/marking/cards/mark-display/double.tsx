import { type UnitOfAssessmentDTO } from "@/dto";

import { MarkerType } from "@/db/types";

import { SingleMarkDisplay } from "./single";

export function DoubleMarkDisplay({ unit }: { unit: UnitOfAssessmentDTO }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <SingleMarkDisplay markerType={MarkerType.SUPERVISOR} unit={unit} />
      <SingleMarkDisplay markerType={MarkerType.READER} unit={unit} />
    </div>
  );
}
