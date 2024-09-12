"use client";
import { useInstanceParams } from "@/components/params-context";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import DataTable from "@/components/ui/data-table/data-table";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { api } from "@/lib/trpc/client";

import { studentResultsColumns } from "./student-results-columns";

export function StudentResultsSection() {
  const params = useInstanceParams();
  const { status, data } =
    api.institution.instance.algorithm.allStudentResults.useQuery({
      params,
    });

  if (status !== "success") return <Skeleton className="h-60 w-full" />;

  return (
    <Tabs defaultValue={data.firstNonEmpty}>
      <Carousel className="mx-14">
        <TabsList className="w-full">
          <CarouselContent className="-ml-4">
            {data.results.map((result, i) => (
              <CarouselItem key={i} className="basis-1/4 pl-4">
                <TabsTrigger
                  className="w-full data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
                  value={result.algName}
                  disabled={result.data.length === 0}
                >
                  {result.displayName}
                </TabsTrigger>
              </CarouselItem>
            ))}
          </CarouselContent>
        </TabsList>
        <CarouselPrevious className="h-10 w-10 rounded-md" />
        <CarouselNext className="h-10 w-10 rounded-md" />
      </Carousel>
      <Separator className="my-4" />
      {data.results.map((result, i) => (
        <TabsContent key={i} value={result.algName}>
          <DataTable columns={studentResultsColumns} data={result.data} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
