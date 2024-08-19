import { ReactNode } from "react";
import { Role, Stage } from "@prisma/client";
import { Home } from "lucide-react";
import Link from "next/link";

import { AccessControl } from "@/components/access-control";
import { Button, buttonVariants } from "@/components/ui/button";
import { Unauthorised } from "@/components/unauthorised";

import { api } from "@/lib/trpc/server";
import { cn } from "@/lib/utils";
import { formatParamsAsPath } from "@/lib/utils/general/get-instance-path";
import { stageLt } from "@/lib/utils/permissions/stage-check";
import { instanceTabs } from "@/lib/validations/instance-tabs";
import { InstanceParams } from "@/lib/validations/params";

export default async function Layout({
  params,
  children,
}: {
  params: InstanceParams;
  children: ReactNode;
}) {
  const role = await api.user.role({ params });
  const stage = await api.institution.instance.currentStage({ params });

  if (role !== Role.STUDENT) {
    return (
      <Unauthorised message="You need to be a Student to access this page" />
    );
  }

  if (stageLt(stage, Stage.PROJECT_SELECTION)) {
    return (
      <Unauthorised message="You are not allowed to access the platform at this time" />
    );
  }

  const preAllocatedTitle = await api.user.student.isPreAllocated({ params });
  const showPreferences = preAllocatedTitle === null;

  const instancePath = formatParamsAsPath(params);

  return (
    <div className="grid w-full grid-cols-6">
      <div className="col-span-1 mt-28 flex justify-center border-r">
        <div className="flex h-max w-fit flex-col items-center gap-2 bg-transparent">
          <Button variant="outline" asChild>
            <Link className="flex items-center gap-2" href={instancePath}>
              <Home className="h-4 w-4" />
              <p>{instanceTabs.instanceHome.title}</p>
            </Link>
          </Button>
          {showPreferences && (
            <SideButton
              href={`${instancePath}/${instanceTabs.myPreferences.href}`}
            >
              {instanceTabs.myPreferences.title}
            </SideButton>
          )}
          <AccessControl allowedStages={[Stage.ALLOCATION_PUBLICATION]}>
            <SideButton
              href={`${instancePath}/${instanceTabs.myAllocation.href}`}
            >
              {instanceTabs.myAllocation.title}
            </SideButton>
          </AccessControl>
        </div>
      </div>
      <section className="col-span-5 max-w-6xl pb-32">{children}</section>
    </div>
  );
}

function SideButton({
  href,
  children: title,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      className={cn(buttonVariants({ variant: "outline" }), "w-full")}
      href={href}
    >
      {title}
    </Link>
  );
}
