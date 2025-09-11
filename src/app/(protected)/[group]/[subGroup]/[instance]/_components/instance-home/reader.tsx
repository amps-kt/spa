import { SectionHeading } from "@/components/heading";
import { NothingToDo } from "@/components/nothing-to-do";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

export async function ReaderHome({
  params,
  hasMultipleRoles,
}: {
  params: InstanceParams;
  hasMultipleRoles: boolean;
}) {
  return (
    <section className="flex flex-col gap-4">
      {hasMultipleRoles && (
        <SectionHeading className="text-muted-foreground -mb-6 text-xl">
          Reader Info
        </SectionHeading>
      )}
      <ReaderHomeInner params={params} />
    </section>
  );
}

async function ReaderHomeInner({ params }: { params: InstanceParams }) {
  const stage = await api.institution.instance.getCurrentStage({ params });

  switch (stage) {
    // todo: fill as appropriate
    default:
      return <NothingToDo />;
  }
}
