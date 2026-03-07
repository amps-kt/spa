"use client";

import { type UnitOfAssessmentDTO } from "@/dto";

import { MarkerType } from "@/db/types";

import { RoleBadge } from "@/components/role-badge";

import { api } from "@/lib/trpc/client";

import { MarksheetRole, useMarksheetContext } from "../../marksheet-context";
import { ResetMarksButton } from "../admin-controls";

import { MarkList } from "./mark-list";

export function SingleMarkDisplay({
  markerType,
  unit,
}: {
  markerType: MarkerType;
  unit: UnitOfAssessmentDTO;
}) {
  const { reader, supervisor, params, studentId, viewerRole } =
    useMarksheetContext();
  const marker = markerType === MarkerType.READER ? reader : supervisor;

  const { data, status } =
    api.msp.marker.unitOfAssessment.getMarksByMarkerId.useQuery({
      params,
      studentId,
      unitId: unit.id,
      markerId: marker.id,
    });

  const dataPresent = data !== undefined && data !== null;
  const isAdmin = [
    MarksheetRole.ADMIN,
    MarksheetRole.READER_ADMIN,
    MarksheetRole.SUPERVISOR_ADMIN,
  ].includes(viewerRole);

  /* label + number of units + overall */
  const rowCount = unit.components.length + 2;
  return (
    <div
      className="grid grid-rows-subgrid col-span-1 p-4 py-0 gap-2"
      style={{ gridRow: `span ${rowCount} / span ${rowCount}` }}
    >
      <h3 className="text-lg mb-4 row-span-1 flex flex-row items-baseline gap-2">
        {/* TODO IF admin, name is link */}
        Marked by <span className="font-bold">{marker.name}</span>{" "}
        <RoleBadge role={markerType} />
        {isAdmin && dataPresent && (
          <ResetMarksButton unitId={unit.id} marker={marker} />
        )}
      </h3>

      {status === "pending" && <p>loading</p>}
      {status === "error" && <p>Something went wrong</p>}
      {status === "success" &&
        (data && !data.draft ? (
          <MarkList unit={unit} marks={data} />
        ) : (
          <p>Marks not yet submitted</p>
        ))}
    </div>
  );
}
