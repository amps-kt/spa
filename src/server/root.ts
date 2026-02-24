import { accessControlRouter } from "./routers/access-control";
import { institutionRouter } from "./routers/institution";
import { teachingOfficeRouter } from "./routers/institution/instance/teachingOffice";
import { markingRouter } from "./routers/marking";
import { projectRouter } from "./routers/project";
import { userRouter } from "./routers/user";

import { createCallerFactory, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  project: projectRouter,
  user: userRouter,
  institution: institutionRouter,
  ac: accessControlRouter,
  marking: markingRouter,
  teachingOffice: teachingOfficeRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
