import {
  type UnitOfAssessmentDTO,
  type StudentDTO,
  type UnitGradeDTO,
  type SupervisorDTO,
  type ReaderDTO,
  type UnitGradingLifecycleState,
} from "@/dto";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

import { Heading } from "../heading";
import { Accordion } from "../ui/accordion";

import { UOACard } from "./cards/u-o-a-card";

import { MarksheetContextProvider } from "./marksheet-context";

export async function Marksheet({
  params,
  student,
  units,
  supervisor,
  reader,
}: {
  params: InstanceParams;
  student: StudentDTO;
  units: {
    unit: UnitOfAssessmentDTO;
    grade?: UnitGradeDTO;
    status: UnitGradingLifecycleState;
  }[];
  supervisor: SupervisorDTO;
  reader: ReaderDTO;
}) {
  const user = await api.user.get();
  const isAdmin = await api.ac.isAdminInInstance({ params });

  return (
    <div>
      <Heading className="mb-10">
        Marksheet for {student.name} ({student.id})
      </Heading>
      <MarksheetContextProvider
        reader={reader}
        supervisor={supervisor}
        params={params}
        studentId={student.id}
        userId={user.id}
        isAdmin={isAdmin}
      >
        <Accordion type="multiple" className="space-y-5">
          {units.map((data) => (
            <UOACard key={data.unit.id} {...data} />
          ))}
        </Accordion>
      </MarksheetContextProvider>
    </div>
  );
}
