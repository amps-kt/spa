"use client";

import { Fragment } from "react";

import { type ClassValue } from "clsx";

import { Grade } from "@/config/grades";

import { type UnitOfAssessmentDTO, type MarkingSubmissionDTO } from "@/dto";

import { MarkerType } from "@/db/types";

import { MarkdownRenderer } from "@/components/markdown-editor";
import { RoleBadge } from "@/components/role-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Item, ItemContent, ItemMedia } from "@/components/ui/item";

import { api } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

import { useMarksheetContext } from "../marksheet-context";

export function DoubleMarkDisplay({ unit }: { unit: UnitOfAssessmentDTO }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <SingleMarkDisplay markerType={MarkerType.SUPERVISOR} unit={unit} />
      <SingleMarkDisplay markerType={MarkerType.READER} unit={unit} />
    </div>
  );
}

export function SingleMarkDisplay({
  markerType,
  unit,
}: {
  markerType: MarkerType;
  unit: UnitOfAssessmentDTO;
}) {
  const { reader, supervisor, params, studentId } = useMarksheetContext();
  const marker = markerType === "READER" ? reader : supervisor;

  const { data, status } =
    api.user.newMarker.getStudentMarkerMarksByUnitId.useQuery({
      params,
      studentId,
      unitId: unit.id,
      markerId: marker.id,
    });

  const count = unit.components.length + 2;

  return (
    <div
      className="grid grid-rows-subgrid col-span-1 p-4 py-0 gap-2"
      style={{ gridRow: `span ${count} / span ${count}` }}
    >
      <h3 className="text-lg mb-4 row-span-1">
        {/* TODO IF admin, name is link */}
        Marked by <span className="font-bold">{marker.name}</span>{" "}
        <RoleBadge role={markerType} />
      </h3>
      {/* {admin && dataPresent && <ResetMarksButton />} */}

      {status === "pending" && <p>loading</p>}
      {status === "error" && <p>Something went wrong</p>}
      {status === "success" && data.marks ? (
        <MarkList unit={unit} marks={data.marks} />
      ) : (
        <p>Marks not yet submitted</p>
      )}
    </div>
  );
}

function MarkList({
  unit,
  marks,
}: {
  unit: UnitOfAssessmentDTO;
  marks: MarkingSubmissionDTO;
}) {
  return (
    <Fragment>
      {unit.components.map((comp) => (
        <MarkingComponentDisplay
          key={comp.id}
          title={comp.title}
          description={comp.description}
          result={marks.marks[comp.id]}
        />
      ))}

      <div className="my-4 px-4">
        <h1 className="text-lg font-semibold my-4">Overall:</h1>
        <div className="flex flex-row items-start gap-5">
          <p className="font-semibold text-secondary text-3xl">
            {Grade.toLetter(marks.grade)}
          </p>
          <p className="text-muted-foreground">{marks.finalComment}</p>
        </div>
      </div>
    </Fragment>
  );
}

function MarkingComponentDisplay({
  className,
  title,
  description,
  result: { mark, justification },
}: {
  className?: ClassValue;
  title: string;
  description: string;
  result: { mark: number; justification: string };
}) {
  return (
    <Card className={cn(className, "row-span-1")}>
      <CardHeader className="pt-4 pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent>
        <Item variant="muted" className="items-start">
          <ItemMedia className="font-semibold text-secondary text-lg">
            {Grade.toLetter(mark)}
          </ItemMedia>
          <ItemContent>
            <MarkdownRenderer
              className="bg-muted! text-muted-foreground! marker:text-muted-foreground"
              source={justification}
            />
          </ItemContent>
        </Item>
      </CardContent>
    </Card>
  );
}
