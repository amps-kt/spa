import { Heading } from "@/components/heading";
import { Unauthorised } from "@/components/unauthorised";

import { api } from "@/lib/trpc/server";
import { SubGroupParams } from "@/lib/validations/params";

import { CreateInstanceForm } from "./_components/create-instance-form";

import { app, metadataTitle } from "@/content/config/app";
import { pages } from "@/content/pages";
import { spacesLabels } from "@/content/spaces";

export async function generateMetadata({ params }: { params: SubGroupParams }) {
  const { displayName } = await api.institution.subGroup.get({ params });

  return {
    title: metadataTitle([pages.newInstance.title, displayName, app.name]),
  };
}

export default async function Page({ params }: { params: SubGroupParams }) {
  const access = await api.institution.subGroup.access({ params });

  if (!access) {
    return (
      <Unauthorised message="You need to be a super-admin or group admin to access this page" />
    );
  }

  const takenNames = await api.institution.subGroup.takenInstanceNames({
    params,
  });

  return (
    <div className="mb-40 mt-6 flex h-max w-full max-w-5xl flex-col gap-10 px-6 pb-20">
      <Heading className="text-4xl">
        Create new {spacesLabels.instance.full}
      </Heading>
      <CreateInstanceForm params={params} takenNames={takenNames} />
    </div>
  );
}
