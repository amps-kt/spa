import { Stage } from "@prisma/client";

import { Heading } from "@/components/heading";
import { CreateProjectForm } from "@/components/pages/create-project-form";
import { Unauthorised } from "@/components/unauthorised";

import { api } from "@/lib/trpc/server";
import { makeRequiredFlags } from "@/lib/utils/general/make-required-flags";
import { stageGt } from "@/lib/utils/permissions/stage-check";
import { InstanceParams } from "@/lib/validations/params";

import { app, metadataTitle } from "@/content/config/app";
import { pages } from "@/content/pages";

export async function generateMetadata({ params }: { params: InstanceParams }) {
  const { displayName } = await api.institution.instance.get({ params });

  return {
    title: metadataTitle([pages.newProject.title, displayName, app.name]),
  };
}

export default async function Page({ params }: { params: InstanceParams }) {
  const stage = await api.institution.instance.currentStage({ params });

  if (stageGt(stage, Stage.PROJECT_SELECTION)) {
    return (
      <Unauthorised message="You really should not be submitting projects at this stage" />
    );
  }

  const supervisor = await api.user.get();
  const formDetails = await api.project.getFormDetails({ params });
  const instanceFlags = await api.institution.instance.getFlags({ params });
  const requiredFlags = makeRequiredFlags(instanceFlags);

  return (
    <div className="w-full max-w-5xl">
      <Heading>New Project</Heading>
      <div className="mx-10">
        <CreateProjectForm
          formInternalData={formDetails}
          supervisor={supervisor}
          requiredFlags={requiredFlags}
        />
      </div>
    </div>
  );
}
