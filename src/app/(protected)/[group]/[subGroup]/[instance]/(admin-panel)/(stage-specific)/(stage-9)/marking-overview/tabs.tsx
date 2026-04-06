import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";

import { api } from "@/lib/trpc/server";
import { InstanceParams } from "@/lib/validations/params";

import { ByMarkerTable } from "./by-marker-table";
import { ByStudentsTable } from "./by-student-table";

export async function MarkingOverviewTabs({
  params,
}: {
  params: InstanceParams;
}) {
  const studentMarkingBreakdown =
    await api.msp.admin.instance.getStudentMarkingStatus({ params });

  return (
    <Tabs
      options={["students", "markers"]}
      defaultValue="students"
      searchParamName="tab"
    >
      <TabsList>
        <TabsTrigger value="students">By Student</TabsTrigger>
        <TabsTrigger value="markers">By Marker</TabsTrigger>
      </TabsList>
      <TabsContent value="students">
        <ByStudentsTable
          params={params}
          initialData={studentMarkingBreakdown}
        />
      </TabsContent>
      <TabsContent value="markers">
        <ByMarkerTable params={params} initialData={[]} />
      </TabsContent>
    </Tabs>
  );
}
