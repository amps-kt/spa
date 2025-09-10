import { compareAsc } from "date-fns";
import { z } from "zod";

import { adjustTarget, adjustUpperBound } from "@/config/submission-target";

import {
  algorithmDtoSchema,
  algorithmResultDtoSchema,
  projectDtoSchema,
  studentDtoSchema,
  userDtoSchema,
} from "@/dto";
import { AlgorithmRunResult } from "@/dto/result/algorithm-run-result";

import { Transformers as T } from "@/db/transformers";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

import { expand } from "@/lib/utils/general/instance-params";
import {
  matchingResultDtoSchema,
  supervisorMatchingDetailsDtoSchema,
} from "@/lib/validations/matching";
import { instanceParamsSchema } from "@/lib/validations/params";

export const algorithmRouter = createTRPCRouter({
  run: procedure.algorithm.subGroupAdmin
    .output(z.object({ total: z.number(), matched: z.number() }))
    .mutation(async ({ ctx: { alg, instance, audit } }) => {
      audit("Running algorithm", { algId: alg.params.algConfigId });
      const matchingData = await instance.getMatchingData(alg);

      if (!matchingData) {
        throw new Error("No matching data found");
      }

      const res = await alg.run(matchingData);

      if (res !== AlgorithmRunResult.OK) {
        // ? perhaps we should just propagate the error and handle it on the client
        throw new Error("Algorithm failed to run");
      }

      try {
        const matchingResults = await alg.getResults();

        return {
          total: matchingData.students.length,
          matched: matchingResults.matching.length,
        };
      } catch (_error) {
        throw new Error("No matching results found");
      }
    }),

  // ! same problem as with renaming allocation instances
  takenNames: procedure.instance.subGroupAdmin
    .output(z.set(z.string()))
    .query(async ({ ctx: { instance } }) => {
      const takenNames = await instance.getAllAlgorithms();
      return new Set(takenNames.map((a) => a.displayName));
    }),

  create: procedure.instance.subGroupAdmin
    .input(z.object({ data: algorithmDtoSchema.omit({ id: true }) }))
    .output(algorithmDtoSchema)
    .mutation(async ({ ctx: { instance, audit }, input: { data } }) => {
      audit("Created new algorithm");
      return await instance.createAlgorithm(data);
    }),

  delete: procedure.algorithm.subGroupAdmin
    .output(z.void())
    .mutation(async ({ ctx: { alg, audit } }) => {
      audit("Deleting algorithm", { algId: alg.params.algConfigId });

      return await alg.delete();
    }),

  getAll: procedure.instance.subGroupAdmin
    .input(z.object({ params: instanceParamsSchema }))
    .output(z.array(algorithmDtoSchema))
    .query(async ({ ctx: { instance } }) => await instance.getAllAlgorithms()),

  // TODO: review how this is used on the client
  getAllSummaryResults: procedure.instance.subGroupAdmin
    .output(z.array(algorithmResultDtoSchema))
    .query(async ({ ctx: { instance } }) => await instance.getSummaryResults()),

  singleResult: procedure.algorithm.subGroupAdmin
    .output(matchingResultDtoSchema)
    .query(async ({ ctx: { alg } }) => await alg.getMatching()),

  allStudentResults: procedure.instance.subGroupAdmin
    .output(
      z.object({
        firstNonEmpty: z.string().or(z.undefined()),
        results: z.array(
          z.object({
            algorithm: algorithmDtoSchema,
            matchingPairs: z.array(
              z.object({
                student: studentDtoSchema,
                project: projectDtoSchema,
                studentRanking: z.number(),
              }),
            ),
          }),
        ),
      }),
    )
    .query(async ({ ctx: { instance, db } }) => {
      // instance.getStudentResults
      const algorithmData = await db.algorithm.findMany({
        where: expand(instance.params),
        include: {
          matchingResult: {
            include: {
              matching: {
                include: {
                  student: {
                    include: {
                      studentFlag: true,
                      userInInstance: { include: { user: true } },
                    },
                  },
                  project: {
                    include: {
                      flagsOnProject: { include: { flag: true } },
                      tagsOnProject: { include: { tag: true } },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      const results = algorithmData
        .map((a) => ({
          algorithm: T.toAlgorithmDTO(a),
          matchingPairs:
            a.matchingResult?.matching.map((m) => ({
              project: T.toProjectDTO(m.project),
              student: T.toStudentDTO(m.student),
              studentRanking: m.studentRanking,
            })) ?? [],
        }))
        .sort((a, b) =>
          compareAsc(a.algorithm.createdAt, b.algorithm.createdAt),
        );

      const firstNonEmptyIdx = results.findIndex(
        (r) => r.matchingPairs.length > 0,
      );

      return {
        results,
        firstNonEmpty: results.at(firstNonEmptyIdx)?.algorithm.id,
      };
    }),

  supervisorResultsForAlg: procedure.algorithm.subGroupAdmin
    .output(
      z.object({
        algorithm: algorithmDtoSchema,
        data: z.array(
          z.object({
            supervisor: userDtoSchema,
            matchingDetails: supervisorMatchingDetailsDtoSchema,
          }),
        ),
      }),
    )
    .query(async ({ ctx: { instance, alg } }) => {
      const preAllocationCounts = await instance.getSupervisorPreAllocations();

      return {
        algorithm: await alg.get(),
        data: await alg.getSupervisorResults(preAllocationCounts),
      };
    }),

  allSupervisorResults: procedure.instance.subGroupAdmin
    .output(
      z.object({
        firstNonEmpty: z.string().or(z.undefined()),
        results: z.array(
          z.object({
            algorithm: algorithmDtoSchema,
            data: z.array(
              z.object({
                supervisor: userDtoSchema,
                matchingDetails: supervisorMatchingDetailsDtoSchema,
              }),
            ),
          }),
        ),
      }),
    )
    .query(async ({ ctx: { instance } }) => {
      const allAlgs = await instance.getAllAlgorithms();
      const preAllocationCounts = await instance.getSupervisorPreAllocations();

      const results = await Promise.all(
        allAlgs
          .sort((a, b) => compareAsc(a.createdAt, b.createdAt))
          .map(async (algData) => {
            const alg = instance.getAlgorithm(algData.id);

            return {
              algorithm: algData,
              data: await alg.getSupervisorResults(preAllocationCounts),
            };
          }),
      );

      const firstNonEmptyIdx = results.findIndex((r) => r.data.length > 0);

      return {
        firstNonEmpty: results.at(firstNonEmptyIdx)?.algorithm.id,
        results,
      };
    }),
});
