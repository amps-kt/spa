"use client";

import { useState } from "react";

import { ZapIcon } from "lucide-react";

import { type FlagDTO } from "@/dto";

import { SectionHeading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { cn } from "@/lib/utils";
import { type InstanceParams } from "@/lib/validations/params";

import { type ByStudentsTable } from "./by-students-table";

export function Main({
  flags,
  params,
}: {
  flags: FlagDTO[];
  params: InstanceParams;
}) {
  const [activeFlag, setActiveFlag] = useState(0);

  return (
    <>
      <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
        {flags.map((flag, idx) => (
          <Button
            key={flag.id}
            size="lg"
            variant={activeFlag === idx ? "default" : "ghost"}
            className={cn(
              "rounded-md w-full text-lg font-medium transition-colors cursor-pointer",
              activeFlag === idx
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-primary/10",
            )}
            onClick={() => setActiveFlag(idx)}
          >
            <p>{flag.displayName}</p>
          </Button>
        ))}
      </div>

      <EtcSection flag={flags[activeFlag]} params={params} />
    </>
  );
}

function EtcSection({
  flag,
  params,
}: {
  flag: FlagDTO;
  params: InstanceParams;
}) {
  return (
    <div>
      <section className="flex flex-col gap-5">
        <SectionHeading icon={ZapIcon}>Quick Actions</SectionHeading>
        <Card className="w-full">
          <CardContent className="mt-6 flex items-center justify-between gap-10">
            ...actions
          </CardContent>
        </Card>
      </section>
      <Tabs
        defaultValue="student"
        searchParamName="group-by"
        options={["student", "marker"]}
      >
        <TabsList>
          <TabsTrigger value="student">By Student</TabsTrigger>
          <TabsTrigger value="marker">By Marker</TabsTrigger>
        </TabsList>
        <TabsContent value="student">
          <ByStudentsTable flag={flag} params={params} />
        </TabsContent>
        <TabsContent value="marker">by-marker-table</TabsContent>
      </Tabs>
    </div>
  );
}
