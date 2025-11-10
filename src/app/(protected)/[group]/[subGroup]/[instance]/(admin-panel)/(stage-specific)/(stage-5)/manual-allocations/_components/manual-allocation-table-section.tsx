"use client";

import { useCallback, useMemo, useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { type FlagDTO, ProjectAllocationStatus } from "@/dto";

import { useInstanceParams } from "@/components/params-context";
import DataTable from "@/components/ui/data-table/data-table";

import { api } from "@/lib/trpc/client";

import { useManualAllocationColumns } from "./manual-allocation-columns";
import { ManualAllocationRow } from "./manual-allocation-row";
import {
  type ManualAllocationProject,
  type ManualAllocationStudent,
  type ManualAllocationSupervisor,
  type ValidationWarning,
  ValidationWarningSeverity,
  ValidationWarningType,
} from "./manual-allocation-types";

interface ManualAllocationDataTableSectionProps {
  initialStudents: ManualAllocationStudent[];
  initialProjects: ManualAllocationProject[];
  initialSupervisors: ManualAllocationSupervisor[];
  projectDescriptors: { flags: FlagDTO[] };
}

export function ManualAllocationDataTableSection({
  initialStudents,
  initialProjects,
  initialSupervisors,
  projectDescriptors: { flags },
}: ManualAllocationDataTableSectionProps) {
  const params = useInstanceParams();
  const router = useRouter();

  const [students, setStudents] = useState(initialStudents);
  const [projects] = useState(initialProjects);
  const [baseSupervisors] = useState(initialSupervisors);

  const utils = api.useUtils();

  const refetchData = useCallback(async () => {
    await utils.institution.instance.getAllocatedStudents.invalidate();
    await utils.institution.instance.getUnallocatedStudents.invalidate();
    await utils.institution.instance.getSupervisorsWithAllocations.invalidate();
    await utils.institution.instance.getProjectsWithAllocationStatus.invalidate();
  }, [utils]);

  const { mutateAsync: api_saveAllocations } =
    api.institution.instance.saveManualStudentAllocation.useMutation({});

  const { mutateAsync: api_removeAllocations } =
    api.institution.instance.matching.removeAllocation.useMutation({});

  // compute supervisors pending allocations
  const supervisors = useMemo(() => {
    const pendingCounts = students.reduce<Record<string, number>>(
      (acc, student) => {
        if (student.selectedSupervisorId && student.isDirty) {
          acc[student.selectedSupervisorId] =
            (acc[student.selectedSupervisorId] ?? 0) + 1;
        }
        return acc;
      },
      {},
    );

    return baseSupervisors.map((supervisor) => ({
      ...supervisor,
      pendingAllocations: pendingCounts[supervisor.id] || 0,
    }));
  }, [students, baseSupervisors]);

  // todo: redo this somehow
  // this is too complicated idk what I was thinking
  // it's also not even totally right
  // I'll have to revisit this when I have both hands
  const calculateWarnings = useCallback(
    (
      allocation: ManualAllocationStudent,
      currentChange?: { studentId: string; supervisorId?: string },
    ): ValidationWarning[] => {
      const warnings: ValidationWarning[] = [];

      if (!allocation.selectedProjectId || !allocation.selectedSupervisorId) {
        return warnings;
      }

      const project = projects.find(
        (p) => p.id === allocation.selectedProjectId,
      );
      const baseSupervisor = supervisors.find(
        (s) => s.id === allocation.selectedSupervisorId,
      );

      if (!project || !baseSupervisor) return warnings;

      // Adjust supervisor data to include current change
      let supervisor = baseSupervisor;
      if (
        currentChange &&
        currentChange.supervisorId === allocation.selectedSupervisorId
        // && project.supervisorId !== allocation.selectedSupervisorId
      ) {
        supervisor = {
          ...baseSupervisor,
          pendingAllocations: baseSupervisor.pendingAllocations + 1,
        };
      }

      // Flag compatibility check
      const hasCompatibleFlag = !!project.flags.find(
        (f) => f.displayName === allocation.flag.displayName,
      );
      if (!hasCompatibleFlag) {
        warnings.push({
          type: ValidationWarningType.FLAG_MISMATCH,
          message: `Student flag (${allocation.flag.displayName}) doesn't match project requirements (${project.flags.map((f) => f.displayName).join(", ")})`,
          severity: ValidationWarningSeverity.WARNING,
        });
      }

      // Project availability checks
      if (
        project.status === ProjectAllocationStatus.ALGORITHMIC ||
        project.status === ProjectAllocationStatus.MANUAL ||
        project.status === ProjectAllocationStatus.RANDOM
      ) {
        warnings.push({
          type: ValidationWarningType.PROJECT_ALLOCATED,
          message: "This project is already allocated to another student",
          severity: ValidationWarningSeverity.ERROR,
        });
      }

      if (project.status === ProjectAllocationStatus.PRE_ALLOCATED) {
        warnings.push({
          type: ValidationWarningType.PROJECT_PRE_ALLOCATED,
          message: "This project is pre-allocated to another student",
          severity: ValidationWarningSeverity.ERROR,
        });
      }

      // Supervisor workload checks
      const totalAllocations =
        supervisor.currentAllocations + supervisor.pendingAllocations;
      if (totalAllocations > supervisor.allocationTarget) {
        warnings.push({
          type: ValidationWarningType.EXCEEDS_TARGET,
          message: `Exceeds supervisor target (${totalAllocations}/${supervisor.allocationTarget})`,
          severity: ValidationWarningSeverity.WARNING,
        });
      }
      if (totalAllocations > supervisor.allocationUpperBound) {
        warnings.push({
          type: ValidationWarningType.EXCEEDS_QUOTA,
          message: `Exceeds supervisor quota (${totalAllocations}/${supervisor.allocationUpperBound})`,
          severity: ValidationWarningSeverity.ERROR,
        });
      }

      // Supervisor change warning
      if (project.supervisorId !== allocation.selectedSupervisorId) {
        warnings.push({
          type: ValidationWarningType.SUPERVISOR_CHANGE,
          message: "Different supervisor than project proposer",
          severity: ValidationWarningSeverity.WARNING,
        });
      }

      // Already allocated check (for existing allocations being changed)
      if (
        allocation.originalProjectId &&
        allocation.originalProjectId !== allocation.selectedProjectId
      ) {
        warnings.push({
          type: ValidationWarningType.ALREADY_ALLOCATED,
          message: "Student already allocated to different project",
          severity: ValidationWarningSeverity.WARNING,
        });
      }

      return warnings;
    },
    [projects, supervisors],
  );

  const handleUpdateAllocation = useCallback(
    (
      studentId: string,
      {
        projectId,
        supervisorId,
      }: { projectId?: string; supervisorId?: string },
    ) => {
      setStudents((prev) =>
        prev.map((student) => {
          if (student.id !== studentId) return student;

          let updatedStudent = { ...student };

          if (projectId !== undefined) {
            const project = projectId
              ? projects.find((p) => p.id === projectId)
              : undefined;

            updatedStudent = {
              ...updatedStudent,
              selectedProjectId: projectId,
              selectedSupervisorId: project?.supervisorId,
            };
          }

          if (supervisorId !== undefined) {
            updatedStudent = {
              ...updatedStudent,
              selectedSupervisorId: supervisorId,
            };
          }

          const isDirty =
            updatedStudent.selectedProjectId !==
              updatedStudent.originalProjectId ||
            updatedStudent.selectedSupervisorId !==
              updatedStudent.originalSupervisorId;

          const warnings = calculateWarnings(updatedStudent, {
            studentId,
            supervisorId: updatedStudent.selectedSupervisorId,
          });

          return { ...updatedStudent, isDirty, warnings };
        }),
      );
    },
    [projects, calculateWarnings, setStudents],
  );

  const handleRemoveAllocation = useCallback(
    async (studentId: string) => {
      await toast
        .promise(api_removeAllocations({ params, studentId }), {
          loading: "Removing allocation...",
          success: "Successfully removed allocation",
          error: "Failed to remove allocation",
        })
        .unwrap()
        .then(async () => {
          await refetchData();
          setStudents((prev) =>
            prev.map((s) => {
              if (s.id !== studentId) return s;

              return {
                ...s,
                originalProjectId: undefined,
                originalSupervisorId: undefined,
                selectedProjectId: undefined,
                selectedSupervisorId: undefined,
                isDirty: false,
                warnings: [],
              };
            }),
          );
        });
    },
    [api_removeAllocations, params, refetchData],
  );

  const handleSave = useCallback(
    async (studentId: string) => {
      const student = students.find((s) => s.id === studentId);
      if (!student) {
        toast.error(`Student with ID ${studentId} not found`);
        return;
      }

      if (!student.selectedProjectId || !student.selectedSupervisorId) {
        toast.error("Please select both project and supervisor before saving");
        return;
      }

      await toast
        .promise(
          api_saveAllocations({
            params,
            studentId: student.id,
            projectId: student.selectedProjectId,
            supervisorId: student.selectedSupervisorId,
          }),
          {
            loading: `Saving allocation for student ${studentId}...`,
            success: "Successfully saved allocation",
            error: "Failed to save allocation",
          },
        )
        .unwrap()
        .then(async () => {
          router.refresh();
          await refetchData();
          setStudents((prev) =>
            prev.map((s) => {
              if (s.id !== studentId) return s;

              return {
                ...s,
                originalProjectId: s.selectedProjectId,
                originalSupervisorId: s.selectedSupervisorId,
                isDirty: false,
                warnings: [],
              };
            }),
          );

          // todo: after saving, remove this project from the list of available projects in all other dropdowns
        });
    },
    [api_saveAllocations, params, refetchData, router, students],
  );

  const handleReset = useCallback((studentId: string) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) return student;

        return {
          ...student,
          selectedProjectId: student.originalProjectId,
          selectedSupervisorId: student.originalSupervisorId,
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

  const columns = useManualAllocationColumns({
    projects,
    supervisors,
    onUpdateAllocation: handleUpdateAllocation,
    onRemoveAllocation: (x) => void handleRemoveAllocation(x),
    onSave: handleSave,
    onReset: handleReset,
  });

  return (
    <section>
      <DataTable
        columns={columns}
        data={students}
        filters={filters}
        CustomRow={ManualAllocationRow}
      />
    </section>
  );
}
