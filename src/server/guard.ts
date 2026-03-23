import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { type User } from "@/data-objects";

import { type DB } from "@/db/types";

import {
  instanceParamsSchema,
  projectParamsSchema,
  type InstanceParams,
} from "@/lib/validations/params";

/**
 * Context available to guard predicates.
 * Provides the authenticated user, the db client, and the parsed params for
 * the current procedure level.
 */
export type GuardCtx<TParams = InstanceParams> = {
  user: User;
  db: DB;
  params: TParams;
};

/**
 * A guard predicate receives the guard context and the raw (already validated)
 * input, and returns whether the request should be allowed.
 */
export type GuardPredicate<TParams = InstanceParams, TInput = unknown> = (
  ctx: GuardCtx<TParams>,
  input: TInput,
) => Promise<boolean> | boolean;

/**
 * Returns a predicate that passes if **any** of the given predicates pass.
 * Short-circuits on the first `true`.
 */
export function anyOf<TParams, TInput = unknown>(
  ...predicates: GuardPredicate<TParams, TInput>[]
): GuardPredicate<TParams, TInput> {
  return async (ctx, input) => {
    for (const p of predicates) {
      if (await p(ctx, input)) return true;
    }
    return false;
  };
}

/**
 * Returns a predicate that passes only if **all** of the given predicates pass.
 * Short-circuits on the first `false`.
 */
export function allOf<TParams, TInput = unknown>(
  ...predicates: GuardPredicate<TParams, TInput>[]
): GuardPredicate<TParams, TInput> {
  return async (ctx, input) => {
    for (const p of predicates) {
      if (!(await p(ctx, input))) return false;
    }
    return true;
  };
}

/**
 * Negates a predicate. Probably not necessary
 */
export function not<TParams, TInput = unknown>(
  predicate: GuardPredicate<TParams, TInput>,
): GuardPredicate<TParams, TInput> {
  return async (ctx, input) => !(await predicate(ctx, input));
}

/**
 * Creates a guard middleware factory for a specific procedure level.
 *
 * The returned function takes a predicate and produces a tRPC middleware that:
 * 1. Parses `params` from the raw input using the provided schema
 * 2. Extracts `user` and `db` from the accumulated context (assumes `authedMiddleware` has already run)
 * 3. Evaluates the predicate
 * 4. Throws UNAUTHORIZED if the predicate returns false
 *
 * This middleware does NOT run `authedMiddleware` itself - it expects `user`
 * to already be on `ctx`. This allows it to compose cleanly with both:
 * - `procedure.instance.guard(...)`
 * - `procedure.instance.withAC({...}).use(instanceGuard(...))`
 */
function createGuardMiddleware<TParams>(
  paramsSchema: z.ZodType<{ params: TParams }>,
) {
  return <TInput = unknown>(predicate: GuardPredicate<TParams, TInput>) =>
    async <TMiddlewareResult, TCtx extends { user: User; db: DB }>({
      ctx,
      input,
      next,
    }: {
      ctx: TCtx;
      input: unknown;
      next: () => Promise<TMiddlewareResult>;
    }) => {
      const { user, db } = ctx;
      const { params } = paramsSchema.parse(input);

      const allowed = await predicate({ user, db, params }, input as TInput);

      if (!allowed) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Guard check failed",
        });
      }

      return next();
    };
}

/**
 * Guard middleware for instance-level procedures.
 *
 * @example
 * ```ts
 * // Composing with withAC:
 * procedure.instance
 *   .withAC({ allowedStages: [...] })
 *   .use(instanceGuard(
 *     anyOf(
 *       ({ user, params }, input) => user.isStudentMarker(params, input.studentId),
 *       ({ user, params }) => user.isSubGroupAdminOrBetter(params),
 *     )
 *   ))
 * ```
 */
export const instanceGuard = createGuardMiddleware(
  z.object({ params: instanceParamsSchema }),
);

export const projectGuard = createGuardMiddleware(
  z.object({ params: projectParamsSchema }),
);
