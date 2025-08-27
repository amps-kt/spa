import { BarChartBigIcon } from "lucide-react";

import { app, metadataTitle } from "@/config/meta";
import { PAGES } from "@/config/pages";

import { Heading, SectionHeading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

export async function generateMetadata({ params }: { params: InstanceParams }) {
  const { displayName } = await api.institution.instance.get({ params });

  return {
    title: metadataTitle([PAGES.allReaders.title, displayName, app.name]),
  };
}

export default async function Page({ params }: { params: InstanceParams }) {
  const { totalRequired, totalAvailable } =
    await api.institution.instance.getReadingOverviewData({ params });

  return (
    <PanelWrapper>
      <Heading>{PAGES.readingOverview.title}</Heading>
      {/* <section className="flex flex-col gap-5">
        <SectionHeading icon={ZapIcon}>Quick Actions</SectionHeading>
        <Button>Download Preferences</Button>
        <Button>Download Allocation</Button>
      </section> */}
      <section className="flex w-full flex-col gap-5">
        <SectionHeading icon={BarChartBigIcon}>Summary</SectionHeading>
        <SummarySection data={{ totalRequired, totalAvailable }} />
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
      <CardContent className="pt-6">
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
