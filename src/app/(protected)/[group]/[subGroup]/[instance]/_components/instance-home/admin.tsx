import { LayersIcon } from "lucide-react";

import { STAGES } from "@/config/stages";

import { SectionHeading } from "@/components/heading";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

export async function AdminHome({
  hasMultipleRoles,
  params,
}: {
  params: InstanceParams;
  hasMultipleRoles: boolean;
}) {
  const stage = await api.institution.instance.getCurrentStage({ params });
  const stageInfo = STAGES[stage];

  return (
    <>
      <section className="mt-6 flex flex-col gap-4">
        {hasMultipleRoles && (
          <SectionHeading className="text-muted-foreground -mb-6 text-xl">
            Admin Info
          </SectionHeading>
        )}
        <div className="mt-9 flex flex-col gap-3">
          <SectionHeading icon={LayersIcon} className="mb-4">
            Current Stage
          </SectionHeading>
          <Card className="w-max">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Badge
                  variant="secondary"
                  className="mr-3 text-2xl rounded-full size-10 grid place-items-center"
                >
                  {stageInfo.number}
                </Badge>
                {stageInfo.displayName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-lg">
                {stageInfo.description}
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
