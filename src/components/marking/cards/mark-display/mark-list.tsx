"use client";

import { Fragment } from "react";

import { Grade } from "@/logic/grading";

import { type UnitOfAssessmentDTO, type FullMarkingSubmissionDTO } from "@/dto";

import { MarkingComponentDisplay } from "./marking-component-display";

export function MarkList({
  unit,
  marks,
}: {
  unit: UnitOfAssessmentDTO;
  marks: FullMarkingSubmissionDTO;
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
