import { app, metadataTitle } from "@/config/meta";

import { Heading } from "@/components/heading";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

export async function generateMetadata({ params }: { params: InstanceParams }) {
  const { displayName } = await api.institution.instance.get({ params });

  return { title: metadataTitle([displayName, app.name]) };
}

export default async function Page({ params }: { params: InstanceParams }) {
  const { displayName } = await api.institution.instance.get({ params });

  return <Heading>{displayName}</Heading>;
}
