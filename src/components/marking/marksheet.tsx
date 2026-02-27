import {
  type UnitOfAssessmentDTO,
  type StudentDTO,
  type UnitGradeDTO,
  type SupervisorDTO,
  type ReaderDTO,
  type UnitGradingLifecycleState,
} from "@/dto";

import { MarkerType } from "@/db/types";

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
  const userMarkerType =
    supervisor.id === user.id ? MarkerType.SUPERVISOR : MarkerType.READER;

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
        markerId={user.id}
      >
        <Accordion type="multiple" className="space-y-5">
          {units
            // ! this filtering should be handled on the server
            // it kinda happens, but I don't think the logic is right
            .filter((u) => u.unit.allowedMarkerTypes.includes(userMarkerType))
            .map((data) => (
              <UOACard key={data.unit.id} {...data} status="REQUIRES_MARKING" />
            ))}
        </Accordion>
      </MarksheetContextProvider>
    </div>
  );
}
