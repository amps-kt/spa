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
  type ValidationWarning,
  ValidationWarningSeverity,
  ValidationWarningType,
} from "./manual-allocation-types";

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
    api.institution.instance.saveManualReaderAllocations.useMutation({});

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
      pendingAllocations: pendingCounts[reader.id] || 0,
    }));
  }, [projects, baseReaders]);

  const calculateWarnings = useCallback(
    (projectData: ManualReadingAllocationRow): ValidationWarning[] => {
      const warnings: ValidationWarning[] = [];

      if (!projectData.selectedReaderId) {
        return warnings;
      }

      const reader = readers.find((r) => r.id === projectData.selectedReaderId);
      if (!reader) return warnings;

      const totalReaderAllocations =
        reader.currentAllocations + reader.pendingAllocations;

      if (totalReaderAllocations > reader.readingWorkloadQuota) {
        warnings.push({
          type: ValidationWarningType.EXCEEDS_READING_QUOTA,
          message: `Exceeds reader quota (${totalReaderAllocations}/${reader.readingWorkloadQuota})`,
          severity: ValidationWarningSeverity.WARNING,
        });
      }

      return warnings;
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

          const warnings = calculateWarnings(updatedProjectData);

          return { ...updatedProjectData, isDirty, warnings };
        }),
      );
    },
    [calculateWarnings],
  );

  const handleRemoveAllocation = useCallback(
    async (projectId: string) => {
      toast.promise(
        api_removeAllocations({ params, projectId }).then(async () => {
          await refetchData();
          setProjects((prev) =>
            prev.map((projectData) => {
              if (projectData.project.id !== projectId) return projectData;

              return {
                ...projectData,
                originalReaderId: undefined,
                selectedReaderId: undefined,
                isDirty: false,
                warnings: [],
              };
            }),
          );
        }),
        {
          loading: "Removing reader allocation...",
          success: "Successfully removed reader allocation",
          error: "Failed to remove reader allocation",
        },
      );
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

      const allocations = [
        {
          projectId: projectData.project.id,
          readerId: projectData.selectedReaderId,
        },
      ];

      toast.promise(
        api_saveAllocations({ params, allocations }).then(async () => {
          router.refresh();
          await refetchData();
          setProjects((prev) =>
            prev.map((p) => {
              if (p.project.id !== projectId) return p;

              return {
                ...p,
                originalReaderId: p.selectedReaderId,
                isDirty: false,
                warnings: [],
              };
            }),
          );
        }),
        {
          loading: `Saving reader allocation for project ${projectId}...`,
          success: "Successfully saved reader allocation",
          error: "Failed to save reader allocation",
        },
      );
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
          warnings: [],
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
    onRemoveAllocation: (x) => void handleRemoveAllocation(x),
    onSave: handleSave,
    onReset: handleReset,
  });

  return (
    <section>
      <DataTable
        columns={columns}
        data={projects}
        filters={filters}
        CustomRow={ManualAllocationRow}
      />
    </section>
  );
}
