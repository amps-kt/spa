import { Heading } from "@/components/heading";
import { Unauthorised } from "@/components/unauthorised";

import { api } from "@/lib/trpc/server";
import { GroupParams } from "@/lib/validations/params";

import { FormSection } from "./_components/form-section";

import { app, metadataTitle } from "@/content/config/app";
import { pages } from "@/content/pages";
import { spacesLabels } from "@/content/spaces";

export async function generateMetadata({ params }: { params: GroupParams }) {
  const { displayName } = await api.institution.group.get({ params });

  return {
    title: metadataTitle([pages.newSubGroup.title, displayName, app.name]),
  };
}

export default async function Page({ params }: { params: GroupParams }) {
  const access = await api.institution.group.access({ params });

  if (!access) {
    return (
      <Unauthorised message="You need to be a super-admin or group admin to access this page" />
    );
  }

  const takenNames = await api.institution.group.takenSubGroupNames({ params });

  return (
    <div className="mb-40 mt-6 flex h-max w-full max-w-5xl flex-col gap-10 px-6 pb-20">
      <Heading className="text-4xl">
        Create new {spacesLabels.subGroup.full}
      </Heading>
      <FormSection takenNames={takenNames} params={params} />
    </div>
  );
}
