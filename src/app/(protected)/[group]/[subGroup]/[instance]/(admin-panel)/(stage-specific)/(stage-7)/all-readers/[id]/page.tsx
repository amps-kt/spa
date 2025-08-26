import { notFound } from "next/navigation";

import { app, metadataTitle } from "@/config/meta";
import { PAGES } from "@/config/pages";

import { Heading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";
import { UserDetailsCard } from "@/components/user-details-card";

import { api } from "@/lib/trpc/server";
import { cn } from "@/lib/utils";
import { type PageParams } from "@/lib/validations/params";

import { InstanceDetailsCard } from "./_components/instance-details-card";
import { ReaderPreferencesDataTable } from "./_components/reader-preferences-data-table";

export async function generateMetadata({ params }: { params: PageParams }) {
  const exists = await api.user.reader.exists({ params, readerId: params.id });
  if (!exists) notFound();

  const { displayName } = await api.institution.instance.get({ params });
  const { name } = await api.user.getById({ userId: params.id });

  return {
    title: metadataTitle([name, PAGES.allReaders.title, displayName, app.name]),
  };
}

export default async function Page({ params }: { params: PageParams }) {
  const readerId = params.id;

  const exists = await api.user.reader.exists({ params, readerId });
  if (!exists) notFound();

  const reader = await api.user.reader.getById({ params, readerId });
  const readerPreferences = await api.institution.instance.getReaderPreferences(
    { params, readerId },
  );

  return (
    <PanelWrapper>
      <Heading
        className={cn(
          "flex items-center justify-between gap-2",
          reader.name.length > 30 && "text-3xl",
        )}
      >
        <p>{reader.name}</p>
      </Heading>
      <div className="flex h-44 items-start justify-between gap-5">
        <UserDetailsCard user={reader} />
        <InstanceDetailsCard reader={reader} />
      </div>
      <ReaderPreferencesDataTable data={readerPreferences} />
    </PanelWrapper>
  );
}
