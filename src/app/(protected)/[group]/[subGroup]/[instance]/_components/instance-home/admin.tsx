import { STAGES } from "@/config/stages";

import { SectionHeading } from "@/components/heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

export async function AdminHome({ params }: { params: InstanceParams }) {
  const stage = await api.institution.instance.getCurrentStage({ params });
  const stageInfo = STAGES[stage];

  return (
    <>
      <SectionHeading>Admin Home</SectionHeading>
      <Card className="grid h-full w-full place-items-center">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Admin Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <span className="text-muted-foreground">Stage:</span>{" "}
              <span>
                {stageInfo.number} - {stageInfo.displayName}
              </span>
            </p>
            <p>
              <span>{stageInfo.description}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
