import { type UnitOfAssessmentDTO, type StudentDTO } from "@/dto";

import { Heading } from "../heading";
import { Accordion } from "../ui/accordion";

import { UOACard } from "./u-o-a-card";

export function Marksheet({
  student,
  units,
}: {
  student: StudentDTO;
  units: UnitOfAssessmentDTO[];
}) {
  return (
    <div>
      <Heading className="mb-10">
        Marksheet for {student.name} ({student.id})
      </Heading>
      <Accordion type="multiple">
        {units.map((u) => (
          <UOACard key={u.id} unit={u} status={"CLOSED"} />
        ))}
      </Accordion>
    </div>
  );
}
