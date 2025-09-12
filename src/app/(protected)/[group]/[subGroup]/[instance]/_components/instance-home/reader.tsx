import { SectionHeading } from "@/components/heading";
import { NothingToDo } from "@/components/nothing-to-do";

import { type InstanceParams } from "@/lib/validations/params";

export async function ReaderHome({
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
      <NothingToDo />
    </section>
  );
}
