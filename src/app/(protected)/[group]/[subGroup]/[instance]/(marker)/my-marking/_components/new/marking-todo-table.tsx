"use client";

import { type MarkerType } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";

import {
  type ProjectDTO,
  type StudentDTO,
  type UnitOfAssessmentDTO,
} from "@/dto";

import {
  type OverallMarkingStatus,
  type UnitMarkingStatus,
} from "@/components/+marking/types";
import DataTable from "@/components/ui/data-table/data-table";

import { api } from "@/lib/trpc/client";
import { type InstanceParams } from "@/lib/validations/params";

type TRow = {
  project: ProjectDTO;
  student: StudentDTO;
  role: MarkerType;
  status: OverallMarkingStatus;
  units: { unit: UnitOfAssessmentDTO; status: UnitMarkingStatus }[];
};

const columns: ColumnDef<TRow>[] = [
  {
    id: "student",
    accessorFn: ({ student: { email, id, name } }) => `${email}${id}${name}`,
  },
  { id: "flag", accessorFn: (x) => x.student.flag.displayName },
  { id: "role", accessorKey: "role" },
  { id: "status", accessorKey: "status" },
];

export function MarkingTodoTable({
  params,
  initialData,
}: {
  params: InstanceParams;
  initialData: TRow[];
}) {
  const { data } = api.user.newMarker.getAssignedMarking.useQuery(
    { params },
    { initialData },
  );

  return <DataTable columns={columns} data={data} />;
}
