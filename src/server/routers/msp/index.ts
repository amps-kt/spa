import { createTRPCRouter } from "../../trpc";

import { unitOfAssessmentRouter } from "./unit-of-assessment";

export const mspRouter = createTRPCRouter({
  unitOfAssessment: unitOfAssessmentRouter,
});
