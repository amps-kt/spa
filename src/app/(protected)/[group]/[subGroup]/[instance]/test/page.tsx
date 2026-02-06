import { fakeStudent } from "@/emails/fake-data";

import { type UnitOfAssessmentDTO } from "@/dto";

import { Marksheet } from "@/components/+marking/marksheet";
import { PanelWrapper } from "@/components/panel-wrapper";

const a: UnitOfAssessmentDTO = {
  id: "dont-know",
  title: "Edgelording",
  studentSubmissionDeadline: new Date(),
  markerSubmissionDeadline: new Date(),
  weight: 0,
  isOpen: true,
  components: [],
  flag: { id: "level-5", displayName: "Level 5", description: "level 5" },
  allowedMarkerTypes: ["SUPERVISOR"],
};

export default async function Page() {
  return (
    <PanelWrapper>
      <Marksheet student={fakeStudent} units={[a]} />
    </PanelWrapper>
  );
}
