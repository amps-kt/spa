"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { type ProjectDTO, type StudentDTO } from "@/dto";

import { type MarkerType } from "@/db/types";

export type SubmissionTableRow = {
  project: ProjectDTO;
  student: StudentDTO;
  markerType: MarkerType;
};

export const columns: ColumnDef<SubmissionTableRow>[] = [
  { id: "projectTitle", accessorKey: "project.title", header: "Project" },
  { id: "role", accessorKey: "markerType", header: "Role" },
];
