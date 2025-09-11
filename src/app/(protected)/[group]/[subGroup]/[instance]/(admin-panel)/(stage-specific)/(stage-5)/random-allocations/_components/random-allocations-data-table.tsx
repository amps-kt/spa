"use client";

import { useCallback } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { type FlagDTO, type ProjectDTO, type StudentDTO } from "@/dto";

import { AllocationMethod } from "@/db/types";

import { useInstanceParams } from "@/components/params-context";
import DataTable from "@/components/ui/data-table/data-table";

import { api } from "@/lib/trpc/client";

import { useRandomAllocationColumns } from "./random-allocation-column";

export function RandomAllocationsDataTable({
  studentData,
  flags,
}: {
  studentData: { student: StudentDTO; project?: ProjectDTO }[];
  flags: FlagDTO[];
}) {
  const params = useInstanceParams();
  const router = useRouter();

  const { mutateAsync: getRandomAllocAsync } =
    api.institution.instance.matching.allocateRandomProjectToStudent.useMutation();

  const { mutateAsync: getRandomAllocForAllAsync } =
    api.institution.instance.matching.allocateRandomProjectsToAll.useMutation();

  const { mutateAsync: removeAllocAsync } =
    api.institution.instance.matching.removeAllocation.useMutation();

  const utils = api.useUtils();

  const refetchData = useCallback(async () => {
    await utils.institution.instance.getAllocatedStudentsByMethod.refetch({
      params,
      methods: [AllocationMethod.RANDOM],
    });
    await utils.institution.instance.getUnallocatedStudents.refetch({ params });
  }, [params, utils]);

  const getRandomAllocation = useCallback(
    async (studentId: string) => {
      void toast.promise(
        getRandomAllocAsync({ params, studentId }).then(async () => {
          await refetchData();
          router.refresh();
        }),
        {
          loading: "Allocating Random project...",
          success: "Successfully allocated random project",
          error: "Failed to allocate project",
        },
      );
    },
    [getRandomAllocAsync, params, refetchData, router],
  );

  const getRandomAllocationForAll = useCallback(async () => {
    void toast.promise(
      getRandomAllocForAllAsync({ params }).then(async () => {
        await refetchData();
        router.refresh();
      }),
      {
        loading: "Allocating Random project...",
        success: "Successfully allocated random project",
        error: "Failed to allocate project",
      },
    );
  }, [getRandomAllocForAllAsync, params, refetchData, router]);

  const removeAllocation = useCallback(
    async (studentId: string) => {
      void toast.promise(
        removeAllocAsync({ params, studentId }).then(async () => {
          await refetchData();
          router.refresh();
        }),
        {
          loading: "Removing project allocation...",
          success: "Successfully removed project allocation",
          error: "Failed to remove project",
        },
      );
    },
    [params, refetchData, removeAllocAsync, router],
  );

  const columns = useRandomAllocationColumns({
    getRandomAllocation,
    getRandomAllocationForAll,
    removeAllocation,
  });

  const filters = [
    {
      title: "filter by Flag",
      columnId: "Flag",
      options: flags.map((flag) => ({
        id: flag.displayName,
        displayName: flag.displayName,
      })),
    },
  ];

  return <DataTable columns={columns} filters={filters} data={studentData} />;
}
