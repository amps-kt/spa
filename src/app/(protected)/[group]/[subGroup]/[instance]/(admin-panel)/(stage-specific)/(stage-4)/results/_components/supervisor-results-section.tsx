"use client";

import { type UserDTO } from "@/dto";

import { ExportCSVButton2 } from "@/components/export-csv";
import { useInstanceParams } from "@/components/params-context";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { api } from "@/lib/trpc/client";
import { type SupervisorMatchingDetailsDTO } from "@/lib/validations/matching";

import { SupervisorResultsDataTable } from "./supervisor-results-data-table";

export function SupervisorResultsSection() {
  const params = useInstanceParams();
  const { status, data } =
    api.institution.instance.algorithm.allSupervisorResults.useQuery({
      params,
    });

  if (status !== "success") return <Skeleton className="h-60 w-full" />;

  return (
    <Tabs
      searchParamName="supervisor-tab"
      options={data.results.map((x) => x.algorithm.id)}
      defaultValue={data.firstNonEmpty ?? ""}
    >
      <Carousel className="mx-14">
        <TabsList className="w-full">
          <CarouselContent className="-ml-4">
            {data.results.map((x, i) => (
              <CarouselItem key={i} className="basis-1/4 pl-4">
                <TabsTrigger
                  className="w-full data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
                  value={x.algorithm.id}
                  disabled={x.data.length === 0}
                >
                  {x.algorithm.displayName}
                </TabsTrigger>
              </CarouselItem>
            ))}
          </CarouselContent>
        </TabsList>
        <CarouselPrevious className="h-10 w-10 rounded-md" />
        <CarouselNext className="h-10 w-10 rounded-md" />
      </Carousel>
      <Separator className="my-4" />
      {data.results.map((x, i) => (
        <TabsContent
          className="flex flex-col items-end"
          key={i}
          value={x.algorithm.id}
        >
          <Button variant="outline" asChild>
            <ExportCSVButton2
              text="Export to CSV"
              header={[
                "supervisorId",
                "supervisorName",
                "supervisorEmail",
                "projectTarget",
                "actualTarget",
                "projectUpperQuota",
                "actualUpperQuota",
                "allocationCount",
                "preAllocatedCount",
                "algorithmTargetDifference",
                "actualTargetDifference",
              ]}
              data={x.data.map(toCSVData)}
              filename={x.algorithm.displayName}
            />
          </Button>
          <SupervisorResultsDataTable data={x.data} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function toCSVData(data: {
  supervisor: UserDTO;
  matchingDetails: SupervisorMatchingDetailsDTO;
}) {
  return {
    supervisorId: data.supervisor.id,
    supervisorName: data.supervisor.name,
    supervisorEmail: data.supervisor.email,
    projectTarget: data.matchingDetails.projectTarget,
    actualTarget: data.matchingDetails.actualTarget,
    projectUpperQuota: data.matchingDetails.projectUpperQuota,
    actualUpperQuota: data.matchingDetails.actualUpperQuota,
    allocationCount: data.matchingDetails.allocationCount,
    preAllocatedCount: data.matchingDetails.preAllocatedCount,
    algorithmTargetDifference: data.matchingDetails.algorithmTargetDifference,
    actualTargetDifference: data.matchingDetails.actualTargetDifference,
  };
}
