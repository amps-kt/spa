"use client";

// eslint-disable-next-line no-restricted-imports
import { useParams } from "next/navigation";
import { toast } from "sonner";

import {
  type ProjectCreationContext,
  type ProjectDTO,
  type ProjectFormSubmissionDTO,
  formToApiTransformations,
} from "@/dto/project";

import { Role } from "@/db/types";

import { Button } from "@/components/ui/button";

import { useAppInstanceRouter } from "@/lib/routing";
import { api } from "@/lib/trpc/client";
import { toPP1 } from "@/lib/utils/instance-params";
import { type PageParams } from "@/lib/validations/params";

import { ProjectRemovalButton } from "./project-removal-button";
import { useProjectForm } from "./use-project-form";

import { ProjectForm } from ".";

interface EditProjectFormProps {
  projectCreationContext: ProjectCreationContext;
  userRole: typeof Role.ADMIN | typeof Role.SUPERVISOR;
  currentUserId: string;
  projectId: string;
  initialData: ProjectDTO;
}

export function EditProjectForm({
  projectCreationContext,
  userRole,
  currentUserId,
  projectId,
  initialData,
}: EditProjectFormProps) {
  const params = useParams<PageParams>();
  const router = useAppInstanceRouter();
  const { form } = useProjectForm(projectCreationContext, initialData);

  const { mutateAsync: api_editProject, isPending } =
    api.project.edit.useMutation();

  const handleSubmit = async (submissionData: ProjectFormSubmissionDTO) => {
    const apiData = formToApiTransformations.submissionToEditApi(
      submissionData,
      projectId,
      currentUserId,
    );

    await toast
      .promise(
        api_editProject({ params: toPP1(params), updatedProject: apiData }),
        {
          success: `Successfully updated Project (${apiData.title})`,
          loading: "Updating project...",
          error: "Something went wrong while updating the project",
        },
      )
      .unwrap()
      .then(() => {
        router.push("projectById", toPP1(params), undefined);
        router.refresh();
      });
  };

  const handleCancel = () => {
    router.push("projectById", toPP1(params), undefined);
  };

  return (
    <ProjectForm
      form={form}
      showSupervisorSelector={true}
      projectCreationContext={projectCreationContext}
      onSubmit={handleSubmit}
      submissionButtonLabel="Update Project"
      userRole={userRole}
      isSubmitting={isPending}
    >
      <Button
        variant="outline"
        size="lg"
        type="button"
        onClick={handleCancel}
        disabled={isPending}
      >
        Cancel
      </Button>
      {/* // TODO: button should require confirmation */}
      <ProjectRemovalButton
        projectId={projectId}
        isAdmin={userRole === Role.ADMIN}
      />
    </ProjectForm>
  );
}
