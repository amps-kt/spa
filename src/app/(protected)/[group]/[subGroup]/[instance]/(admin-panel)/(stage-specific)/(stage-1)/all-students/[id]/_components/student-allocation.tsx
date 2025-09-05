import { type ClassValue } from "clsx";
import { AwardIcon, BookOpenIcon, HashIcon, UserIcon } from "lucide-react";
import Link from "next/link";

import { PAGES } from "@/config/pages";

import { type ProjectDTO, type SupervisorDTO } from "@/dto";

import { CircleCheckSolidIcon } from "@/components/icons/circle-check";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/lib/utils";

export function StudentAllocationCard({
  allocation: { project, supervisor, rank },
  selfDefined,
  className,
}: {
  allocation: { project: ProjectDTO; supervisor: SupervisorDTO; rank: number };
  selfDefined: boolean;
  className?: ClassValue;
}) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <AwardIcon className="h-6 w-6 text-indigo-500" />
          <span>Project Allocation</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start">
            <span className="flex items-center">
              <BookOpenIcon className="mr-2 h-4 w-4 flex-none text-muted-foreground" />
              <span className="mr-2 font-medium">Title:</span>
            </span>
            <Link
              className={cn(
                buttonVariants({ variant: "link" }),
                "mr-2 h-max p-0 text-base font-medium leading-5",
              )}
              href={`../projects/${project.id}`}
            >
              {project.title}
            </Link>
          </div>
          <div className="flex items-center">
            <UserIcon className="mr-2 h-4 w-4 opacity-70" />
            <span className="mr-2 font-medium">Supervisor:</span>
            <Link
              className={cn(
                buttonVariants({ variant: "link" }),
                "mr-2 h-max p-0 text-base font-medium leading-5",
              )}
              href={`../${PAGES.allSupervisors.href}/${supervisor.id}`}
            >
              {supervisor.name}
            </Link>
          </div>
          {selfDefined ? (
            <div className="flex items-center gap-2">
              <CircleCheckSolidIcon className="h-4 w-4 fill-blue-500" />
              <p>This student has defined their own project.</p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <HashIcon className="h-4 w-4 text-muted-foreground" />
              <span className="mr-2 font-medium">Rank:</span>
              {rank}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
