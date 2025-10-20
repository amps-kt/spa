import {
  BarChartBigIcon,
  DownloadIcon,
  FileBadgeIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";

import { PAGES } from "@/config/pages";

import { Heading, SectionHeading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DataTable from "@/components/ui/data-table/data-table";
import { TableBody, TableRow, TableCell, Table } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

import { byProjectColumns } from "./_components/by-project-columns";
import { RunAlgorithmButton } from "./_components/run-algorithm-button";

export default async function ReaderAllocationOverview({
  params,
}: {
  params: InstanceParams;
}) {
  const { totalRequired, totalAvailable } =
    await api.institution.instance.getReadingOverviewData({ params });

  return (
    <PanelWrapper className="mt-5 gap-10">
      <Heading>{PAGES.readerAllocationOverview.title}</Heading>
      <section className="flex w-full flex-col gap-5">
        <SectionHeading icon={BarChartBigIcon}>Summary</SectionHeading>
        <SummarySection data={{ totalRequired, totalAvailable }} />
      </section>
      <section className="flex flex-col gap-5">
        <SectionHeading icon={ZapIcon}>Quick Actions</SectionHeading>
        <Card>
          <CardContent className="mt-6 flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <p>Run the algorithm</p>
              <RunAlgorithmButton params={params} />
            </div>
            <div className="flex justify-between items-center">
              <p>Download result</p>
              <Button
                variant="outline"
                className="w-50 flex justify-start gap-3"
                asChild
              >
                <Link
                  href="reader-allocation-overview/reader-matching.csv"
                  target="_blank"
                  download
                >
                  <DownloadIcon className="size-4" />
                  Download Allocation
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Tabs
          defaultValue={"by-project"}
          searchParamName={"table-tab"}
          options={["summary", "details"]}
        >
          <div className="flex flex-row justify-between">
            <SectionHeading icon={FileBadgeIcon}>Results</SectionHeading>
            <TabsList>
              <TabsTrigger value="by-reader">By Reader</TabsTrigger>
              <TabsTrigger value="by-project">By Project</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="by-reader">
            <ByReaderTable />
          </TabsContent>
          <TabsContent value="by-project">
            <ByProjectTable params={params} />
          </TabsContent>
        </Tabs>
      </section>
    </PanelWrapper>
  );
}

function SummarySection({
  data,
}: {
  data: { totalRequired: number; totalAvailable: number };
}) {
  return (
    <Card className="w-full max-w-96">
      <CardHeader>
        <CardTitle>Reading Units:</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow className="flex items-center justify-between">
              <TableCell className="text-base font-medium">Required</TableCell>
              <TableCell>
                <Badge
                  className="min-w-10 rounded-full text-center"
                  variant="accent"
                >
                  <p className="w-full">{data.totalRequired}</p>
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow className="flex items-center justify-between">
              <TableCell className="text-base font-medium">Available</TableCell>
              <TableCell>
                <Badge
                  className="min-w-10 rounded-full text-center"
                  variant="accent"
                >
                  <p className="w-full">{data.totalAvailable}</p>
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ByReaderTable() {
  // reader, target, actual, (delta)
  return <div>summary</div>;
}

async function ByProjectTable({ params }: { params: InstanceParams }) {
  const allocation = await api.institution.instance.getReaderAllocation({
    params,
  });

  return (
    <DataTable
      data={allocation}
      searchParamPrefix="by-project"
      columns={byProjectColumns}
    />
  );
}
