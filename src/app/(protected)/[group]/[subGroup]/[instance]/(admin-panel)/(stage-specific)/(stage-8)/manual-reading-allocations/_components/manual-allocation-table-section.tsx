"use client";

import { useCallback, useMemo, useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { type FlagDTO } from "@/dto";

import { useInstanceParams } from "@/components/params-context";
import DataTable from "@/components/ui/data-table/data-table";

import { api } from "@/lib/trpc/client";

import { useManualReadingAllocationColumns } from "./manual-allocation-columns";
import { ManualAllocationRow } from "./manual-allocation-row";
import {
  type ManualReadingAllocationRow,
  type ManualReadingAllocationReader,
} from "./manual-allocation-types";
import { WarningProvider } from "./warning-context";

interface ManualReadingAllocationDataTableSectionProps {
  initialProjects: ManualReadingAllocationRow[];
  initialReaders: ManualReadingAllocationReader[];
  projectDescriptors: { flags: FlagDTO[] };
}

export function ManualReadingAllocationDataTableSection({
  initialProjects,
  initialReaders,
  projectDescriptors: { flags },
}: ManualReadingAllocationDataTableSectionProps) {
  const params = useInstanceParams();
  const router = useRouter();

  const [projects, setProjects] = useState(initialProjects);
  const [baseReaders] = useState(initialReaders);

  const utils = api.useUtils();

  const refetchData = useCallback(async () => {
    await utils.institution.instance.getProjectsWithReadingAllocationStatus.invalidate();
    await utils.institution.instance.getReadersWithWorkload.invalidate();
  }, [utils]);

  const { mutateAsync: api_saveAllocations } =
    api.institution.instance.saveManualReaderAllocation.useMutation({});

  const { mutateAsync: api_removeAllocations } =
    api.institution.instance.removeReaderAllocation.useMutation({});

  const readers = useMemo(() => {
    const pendingCounts = projects.reduce<Record<string, number>>(
      (acc, project) => {
        if (project.selectedReaderId && project.isDirty) {
          acc[project.selectedReaderId] =
            (acc[project.selectedReaderId] ?? 0) + 1;
        }
        return acc;
      },
      {},
    );

    return baseReaders.map((reader) => ({
      ...reader,
      pendingAllocations: pendingCounts[reader.id] ?? 0,
    }));
  }, [projects, baseReaders]);

  const getReaderQuotaWarning = useCallback(
    (readerId: string) => {
      const reader = readers.find((r) => r.id === readerId);
      if (!reader) return;

      const totalAllocations =
        reader.currentAllocations + reader.pendingAllocations;
      if (totalAllocations > reader.readingWorkloadQuota) {
        return {
          message: `Exceeds reader quota (${totalAllocations}/${reader.readingWorkloadQuota})`,
        };
      }
      return;
    },
    [readers],
  );

  const handleUpdateAllocation = useCallback(
    (projectId: string, { readerId }: { readerId?: string }) => {
      setProjects((prev) =>
        prev.map((projectData) => {
          if (projectData.project.id !== projectId) return projectData;

          const updatedProjectData = {
            ...projectData,
            selectedReaderId: readerId,
          };

          const isDirty =
            updatedProjectData.selectedReaderId !==
            updatedProjectData.originalReaderId;

          return { ...updatedProjectData, isDirty };
        }),
      );
    },
    [],
  );

  const handleRemoveAllocation = useCallback(
    async (projectId: string) => {
      return await toast
        .promise(api_removeAllocations({ params, projectId }), {
          loading: "Removing reader allocation...",
          success: "Successfully removed reader allocation",
          error: "Failed to remove reader allocation",
        })
        .unwrap()
        .then(async () => {
          await refetchData();
          setProjects((prev) =>
            prev.map((projectData) => {
              if (projectData.project.id !== projectId) return projectData;

              return {
                ...projectData,
                originalReaderId: undefined,
                selectedReaderId: undefined,
                isDirty: false,
              };
            }),
          );
        });
    },
    [api_removeAllocations, params, refetchData],
  );

  const handleSave = useCallback(
    async (projectId: string) => {
      const projectData = projects.find((p) => p.project.id === projectId);

      if (!projectData) {
        toast.error(`Project with ID ${projectId} not found`);
        return;
      }

      if (!projectData.selectedReaderId) {
        toast.error(`No reader selected for project ${projectId}`);
        return;
      }

      return await toast
        .promise(
          api_saveAllocations({
            params,
            projectId: projectId,
            readerId: projectData.selectedReaderId,
          }),
          {
            loading: `Saving reader allocation for project ${projectData.project.title}...`,
            success: "Successfully saved reader allocation",
            error: "Failed to save reader allocation",
          },
        )
        .unwrap()
        .then(async () => {
          router.refresh();
          await refetchData();
          setProjects((prev) =>
            prev.map((p) => {
              if (p.project.id !== projectId) return p;

              return {
                ...p,
                originalReaderId: p.selectedReaderId,
                isDirty: false,
              };
            }),
          );
        });
    },
    [api_saveAllocations, params, refetchData, router, projects],
  );

  const handleReset = useCallback((projectId: string) => {
    setProjects((prev) =>
      prev.map((projectData) => {
        if (projectData.project.id !== projectId) return projectData;

        return {
          ...projectData,
          selectedReaderId: projectData.originalReaderId,
          isDirty: false,
        };
      }),
    );
  }, []);

  const filters = useMemo(() => {
    return [
      {
        title: "filter by Flags",
        columnId: "Flags",
        options: flags.map((flag) => ({
          id: flag.id,
          displayName: flag.displayName,
        })),
      },
    ];
  }, [flags]);

  const columns = useManualReadingAllocationColumns({
    readers,
    onUpdateAllocation: handleUpdateAllocation,
    onRemoveAllocation: handleRemoveAllocation,
    onSave: handleSave,
    onReset: handleReset,
  });

  return (
    <section>
      <WarningProvider getReaderQuotaWarning={getReaderQuotaWarning}>
        <DataTable
          columns={columns}
          data={projects}
          filters={filters}
          CustomRow={ManualAllocationRow}
        />
      </WarningProvider>
    </section>
  );
}
