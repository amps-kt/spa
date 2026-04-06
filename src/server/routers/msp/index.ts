import { createTRPCRouter } from "../../trpc";

import { mspAdminInstanceRouter } from "./admin/instace";
import { unitOfAssessmentRouter as adminUnitOfAssessmentRouter } from "./admin/unit-of-assessment";
import { markerProjectRouter } from "./marker/project";
import { unitOfAssessmentRouter as markerUnitOfAssessmentRouter } from "./marker/unit-of-assessment";

export const mspRouter = createTRPCRouter({
  marker: createTRPCRouter({
    unitOfAssessment: markerUnitOfAssessmentRouter,
    project: markerProjectRouter,
  }),
  admin: createTRPCRouter({
    unitOfAssessment: adminUnitOfAssessmentRouter,
    instance: mspAdminInstanceRouter,
  }),
});
