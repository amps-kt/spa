"use client";

import { AdminLevel } from "@prisma/client";

import { AdminLevelAC } from "@/components/access-control/admin-level-ac";

import { withinBounds } from "@/lib/utils/allocation-adjustment/project";
import { withinCapacity } from "@/lib/utils/allocation-adjustment/supervisor";

import { ConflictBanner } from "./conflict-banner";
import { DebugComponent } from "./debug-component";
import { useAllocDetails } from ".";

export function ConflictToaster() {
  const allProjects = useAllocDetails((s) => s.projects);
  const supervisors = useAllocDetails((s) => s.supervisors);

  const oversubscribedProjects = allProjects.filter((p) => !withinBounds(p));
  const overWorkedSupervisors = supervisors.filter(
    (s) => !withinCapacity(allProjects, s),
  );

  return (
    <div className="flex flex-col gap-3">
      <AdminLevelAC minimumAdminLevel={AdminLevel.SUPER}>
        <DebugComponent
          DEBUG={false}
          supervisors={supervisors}
          allProjects={allProjects}
        />
      </AdminLevelAC>
      {oversubscribedProjects.map((p, i) => (
        <ConflictBanner key={i} type="project">
          Project {p.id} is oversubscribed
        </ConflictBanner>
      ))}
      {overWorkedSupervisors.map((s, i) => (
        <ConflictBanner key={i} type="supervisor">
          Supervisor {s.supervisorId} is assigned more students than
          they&apos;re able to take on
        </ConflictBanner>
      ))}
    </div>
  );
}
