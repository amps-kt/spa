import { PrismaTransactionClient } from "@/lib/db";
import { expand } from "@/lib/utils/general/instance-params";
import { InstanceParams } from "@/lib/validations/params";

export async function mark(
  tx: PrismaTransactionClient,
  params: InstanceParams,
  supervisorCounts: Record<string, number>,
  projectCounts: Record<string, number>,
) {
  const students = await getAvailableStudents(tx, params);
  const { supervisors, projects } = await getSupervisorsWithSlack(
    tx,
    params,
    supervisorCounts,
    projectCounts,
  );

  return { supervisors, projects, students };
}

export type MarkedData = Awaited<ReturnType<typeof mark>>;

export type MarkedStudentDto = MarkedData["students"][number];

export type MarkedSupervisorDto = MarkedData["supervisors"][number];

export type MarkedProjectDto = MarkedData["projects"][number];

/**
 * Get supervisors who still have not reached their capacity
 * @param tx
 * @param params
 * @returns
 */

async function getSupervisorsWithSlack(
  tx: PrismaTransactionClient,
  params: InstanceParams,
  supervisorCounts: Record<string, number>,
  projectCounts: Record<string, number>,
) {
  const supervisorData = await tx.supervisorInstanceDetails.findMany({
    where: expand(params),
    select: {
      userId: true,
      projectAllocationTarget: true,
      projectAllocationUpperBound: true,
      userInInstance: {
        select: {
          supervisorProjects: {
            include: { flagOnProjects: true, tagOnProject: true },
          },
        },
      },
    },
  });

  const supervisors = supervisorData
    .filter(
      (s) => s.projectAllocationUpperBound > (supervisorCounts[s.userId] ?? 0),
    )
    .map((s) => ({
      userId: s.userId,
      projectAllocationTarget: s.projectAllocationTarget,
      projectAllocationUpperBound: s.projectAllocationUpperBound,
      projectIds: s.userInInstance.supervisorProjects.filter(
        (p) => p.capacityUpperBound > (projectCounts[p.id] ?? 0),
      ),
    }));

  return { supervisors, projects: supervisors.flatMap((s) => s.projectIds) };
}
/**
 * Get students with no allocation and their preferences (unconditionally)
 * @param tx
 * @param params
 * @returns
 */

async function getAvailableStudents(
  tx: PrismaTransactionClient,
  params: InstanceParams,
) {
  return await tx.studentDetails.findMany({
    where: {
      ...expand(params),
      userInInstance: { studentAllocation: { is: null } },
    },
    select: {
      userId: true,
      studentLevel: true,
      preferences: { select: { project: true }, orderBy: { rank: "asc" } },
      userInInstance: {
        select: { studentPreferences: { include: { project: true } } },
      },
    },
  });
}
