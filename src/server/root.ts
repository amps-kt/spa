import { accessControlRouter } from "./routers/access-control";
import { institutionRouter } from "./routers/institution";
import { markingRouter } from "./routers/marking";
import { mspRouter } from "./routers/msp";
import { projectRouter } from "./routers/project";
import { userRouter } from "./routers/user";

import { createCallerFactory, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  msp: mspRouter, // <- New!
  project: projectRouter,
  user: userRouter,
  institution: institutionRouter,
  ac: accessControlRouter,
  marking: markingRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
