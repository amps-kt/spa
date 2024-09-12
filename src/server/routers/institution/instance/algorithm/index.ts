import { Role } from "@prisma/client";
import { z } from "zod";

import {
  AlgorithmResultDto,
  algorithmSchema,
  builtInAlgSchema,
} from "@/lib/validations/algorithm";
import {
  blankResult,
  MatchingDetailsDto,
  matchingResultSchema,
  SupervisorMatchingDetailsDto,
} from "@/lib/validations/matching";
import { instanceParamsSchema } from "@/lib/validations/params";

import { createTRPCRouter, instanceAdminProcedure } from "@/server/trpc";

import { applyModifiers } from "./_utils/apply-modifiers";
import { executeMatchingAlgorithm } from "./_utils/execute-matching-algorithm";
import {
  extractMatchingDetails,
  parseMatchingResult,
} from "./_utils/extract-matching-details";
import { getAlgorithmsInOrder } from "./_utils/get-algorithms-in-order";
import { getBuiltInAlgorithm } from "./_utils/get-built-in-algorithm";
import { getMatchingData } from "./_utils/get-matching-data";

export const algorithmRouter = createTRPCRouter({
  run: instanceAdminProcedure
    .input(
      z.object({
        params: instanceParamsSchema,
        algorithm: algorithmSchema,
      }),
    )
    .mutation(
      async ({
        ctx,
        input: {
          params: { group, subGroup, instance },
          algorithm,
        },
      }) => {
        const matchingData = await getMatchingData(ctx.db, ctx.instance).then(
          (data) => applyModifiers(data, algorithm),
        );

        const matchingResults = await executeMatchingAlgorithm({
          algorithm,
          matchingData,
        });

        const builtInAlg = getBuiltInAlgorithm(algorithm.algName);

        if (builtInAlg) {
          await ctx.db.algorithm.upsert({
            where: {
              algorithmId: {
                algName: algorithm.algName,
                allocationGroupId: group,
                allocationSubGroupId: subGroup,
                allocationInstanceId: instance,
              },
            },
            update: { matchingResultData: JSON.stringify(matchingResults) },
            create: {
              ...builtInAlg,
              allocationGroupId: group,
              allocationSubGroupId: subGroup,
              allocationInstanceId: instance,
              matchingResultData: JSON.stringify(matchingResults),
            },
          });
        } else {
          await ctx.db.algorithm.update({
            where: {
              algorithmId: {
                algName: algorithm.algName,
                allocationGroupId: group,
                allocationSubGroupId: subGroup,
                allocationInstanceId: instance,
              },
            },
            data: { matchingResultData: JSON.stringify(matchingResults) },
          });
        }

        return {
          totalStudents: matchingData.students.length,
          matchedStudents: matchingResults.size,
        };
      },
    ),

  takenNames: instanceAdminProcedure
    .input(z.object({ params: instanceParamsSchema }))
    .query(
      async ({
        ctx,
        input: {
          params: { group, subGroup, instance },
        },
      }) => {
        const takenNames = await ctx.db.algorithm.findMany({
          where: {
            allocationGroupId: group,
            allocationSubGroupId: subGroup,
            allocationInstanceId: instance,
          },
          select: { algName: true },
        });
        return takenNames.map(({ algName }) => algName);
      },
    ),

  create: instanceAdminProcedure
    .input(z.object({ params: instanceParamsSchema, data: algorithmSchema }))
    .mutation(
      async ({
        ctx,
        input: {
          params: { group, subGroup, instance },
          data: {
            algName,
            flag1,
            flag2,
            flag3,
            targetModifier,
            upperBoundModifier,
            maxRank,
          },
        },
      }) => {
        await ctx.db.algorithm.create({
          data: {
            algName,
            displayName: algName,
            flag1,
            flag2,
            flag3,
            targetModifier,
            upperBoundModifier,
            maxRank,
            allocationGroupId: group,
            allocationSubGroupId: subGroup,
            allocationInstanceId: instance,
            matchingResultData: JSON.stringify({}),
          },
        });
      },
    ),

  delete: instanceAdminProcedure
    .input(z.object({ params: instanceParamsSchema, algName: z.string() }))
    .mutation(
      async ({
        ctx,
        input: {
          params: { group, subGroup, instance },
          algName,
        },
      }) => {
        await ctx.db.algorithm.delete({
          where: {
            algorithmId: {
              algName,
              allocationGroupId: group,
              allocationSubGroupId: subGroup,
              allocationInstanceId: instance,
            },
          },
        });
      },
    ),

  getAll: instanceAdminProcedure
    .input(
      z.object({
        params: instanceParamsSchema,
      }),
    )
    .query(
      async ({
        ctx,
        input: {
          params: { group, subGroup, instance },
        },
      }) => {
        const customAlgorithms = await ctx.db.algorithm.findMany({
          where: {
            allocationGroupId: group,
            allocationSubGroupId: subGroup,
            allocationInstanceId: instance,
            NOT: builtInAlgSchema.options.map((algName) => ({ algName })),
          },
        });

        const allAlgorithms = getAlgorithmsInOrder(customAlgorithms);

        return allAlgorithms.map((a) => ({
          algName: a.algName,
          displayName: a.displayName,
          description: a.description ?? "",
          targetModifier: a.targetModifier,
          upperBoundModifier: a.upperBoundModifier,
          maxRank: a.maxRank,
          flags: [a.flag1, a.flag2, a.flag3].filter((f) => f !== null),
        }));
      },
    ),

  getAllSummaryResults: instanceAdminProcedure
    .input(
      z.object({
        params: instanceParamsSchema,
      }),
    )
    .query(
      async ({
        ctx,
        input: {
          params: { group, subGroup, instance },
        },
      }) => {
        const algorithmData = await ctx.db.algorithm.findMany({
          where: {
            allocationGroupId: group,
            allocationSubGroupId: subGroup,
            allocationInstanceId: instance,
          },
          select: {
            algName: true,
            displayName: true,
            matchingResultData: true,
          },
          orderBy: { algName: "asc" },
        });

        const resultsByAlgName = new Map<string, AlgorithmResultDto>();

        for (const {
          algName,
          displayName,
          matchingResultData: data,
        } of algorithmData) {
          const { weight, size, profile, cost } = parseMatchingResult(data);
          const dto = { algName, displayName, weight, size, profile, cost };
          resultsByAlgName.set(algName, dto);
        }

        const algs = getAlgorithmsInOrder(algorithmData);
        return algs.map((a) => resultsByAlgName.get(a.algName)!);
      },
    ),

  singleResult: instanceAdminProcedure
    .input(
      z.object({
        params: instanceParamsSchema,
        algName: z.string(),
      }),
    )
    .query(
      async ({
        ctx,
        input: {
          algName,
          params: { group, subGroup, instance },
        },
      }) => {
        const res = await ctx.db.algorithm.findFirst({
          where: {
            algName,
            allocationGroupId: group,
            allocationSubGroupId: subGroup,
            allocationInstanceId: instance,
          },
          select: { matchingResultData: true },
        });

        if (!res) return blankResult;

        const result = matchingResultSchema.safeParse(
          JSON.parse(res.matchingResultData as string),
        );

        if (!result.success) return blankResult;

        return result.data;
      },
    ),

  allStudentResults: instanceAdminProcedure
    .input(z.object({ params: instanceParamsSchema }))
    .query(
      async ({
        ctx,
        input: {
          params: { group, subGroup, instance },
        },
      }) => {
        const algorithmData = await ctx.db.algorithm.findMany({
          where: {
            allocationGroupId: group,
            allocationSubGroupId: subGroup,
            allocationInstanceId: instance,
          },
          select: {
            algName: true,
            displayName: true,
            matchingResultData: true,
          },
          orderBy: { algName: "asc" },
        });

        const { projects, users } =
          await ctx.db.allocationInstance.findFirstOrThrow({
            where: {
              allocationGroupId: group,
              allocationSubGroupId: subGroup,
              id: instance,
            },
            select: {
              projects: true,
              users: {
                where: { role: Role.STUDENT },
                select: { user: { select: { id: true, name: true } } },
              },
            },
          });

        const students = users.map((u) => u.user);

        const resultsByAlgName = new Map<string, MatchingDetailsDto[]>();

        for (const { algName, matchingResultData: data } of algorithmData) {
          const matching = parseMatchingResult(data).matching;

          const details = matching.map((m) =>
            extractMatchingDetails(
              students,
              projects,
              m.student_id,
              m.project_id,
              m.preference_rank,
            ),
          );

          resultsByAlgName.set(algName, details);
        }

        const allAlgorithms = getAlgorithmsInOrder(algorithmData);

        const results = allAlgorithms.map(({ algName, displayName }) => ({
          algName,
          displayName,
          data: resultsByAlgName.get(algName) ?? [],
        }));

        const firstNonEmptyIdx = results.findIndex((r) => r.data.length > 0);

        return {
          results,
          firstNonEmpty: results.at(firstNonEmptyIdx)?.algName,
        };
      },
    ),

  allSupervisorResults: instanceAdminProcedure
    .input(z.object({ params: instanceParamsSchema }))
    .query(
      async ({
        ctx,
        input: {
          params: { group, subGroup, instance },
        },
      }) => {
        const algorithmData = await ctx.db.algorithm.findMany({
          where: {
            allocationGroupId: group,
            allocationSubGroupId: subGroup,
            allocationInstanceId: instance,
          },
          select: {
            algName: true,
            displayName: true,
            matchingResultData: true,
          },
          orderBy: { algName: "asc" },
        });

        const supervisorData = await ctx.db.supervisorInstanceDetails.findMany({
          where: {
            allocationGroupId: group,
            allocationSubGroupId: subGroup,
            allocationInstanceId: instance,
          },
          select: {
            userInInstance: {
              select: { user: { select: { id: true, name: true } } },
            },
          },
        });

        const supervisors = supervisorData.map((u) => u.userInInstance.user);

        const resultsByAlgName = new Map<
          string,
          SupervisorMatchingDetailsDto[]
        >();

        for (const { algName, matchingResultData: data } of algorithmData) {
          const matching = parseMatchingResult(data).matching;

          const details = matching.reduce(
            (acc, m) => {
              const s = supervisors.find((s) => s.id === m.supervisor_id);
              if (!s) {
                throw new Error(`Supervisor ${m.supervisor_id} not found`);
              }

              return {
                ...acc,
                [m.supervisor_id]: {
                  supervisorId: m.supervisor_id,
                  supervisorName: s.name,
                  projectTarget: m.supervisor_capacities.target,
                  projectUpperQuota: m.supervisor_capacities.upper_bound,
                  allocationCount:
                    (acc[m.supervisor_id]?.allocationCount ?? 0) + 1,
                },
              };
            },
            {} as Record<string, SupervisorMatchingDetailsDto>,
          );

          resultsByAlgName.set(algName, Object.values(details));
        }

        const allAlgorithms = getAlgorithmsInOrder(algorithmData);

        const results = allAlgorithms.map(({ algName, displayName }) => ({
          algName,
          displayName,
          data: resultsByAlgName.get(algName) ?? [],
        }));

        const firstNonEmptyIdx = results.findIndex((r) => r.data.length > 0);

        return {
          results,
          firstNonEmpty: results.at(firstNonEmptyIdx)?.algName,
        };
      },
    ),
});
