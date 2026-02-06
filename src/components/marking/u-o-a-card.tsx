import { fakeReader, fakeReaderSubmission } from "@/emails/fake-data";
import { format } from "date-fns";

import {
  type UnitMarkingStatus,
  type MarkingSubmissionDTO,
  type ReaderDTO,
  type UnitOfAssessmentDTO,
} from "@/dto";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Separator } from "../ui/separator";

import { UoaStatusIndicator } from "./uoa-status-indicator";

export function UOACard({
  unit,
  status,
}: {
  unit: UnitOfAssessmentDTO;
  status: UnitMarkingStatus;
}) {
  return (
    <AccordionItem className="" value={unit.id}>
      <AccordionTrigger>
        <h2 className="text-xl mr-auto">{unit.title}</h2>
        <div className="flex flex-col items-end mr-10">
          <UoaStatusIndicator status={status} />
          {/* Think harder about this */}
          {status !== "DONE" && (
            <div>
              Marking Due on{" "}
              <strong className="font-bold">
                {format(unit.markerSubmissionDeadline, "dd MMM yyyy - HH:mm")}
              </strong>
            </div>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {unit.allowedMarkerTypes.length == 1 ? (
          <SingleMarkerUnit
            marker={fakeReader}
            unit={unit}
            marks={fakeReaderSubmission}
          />
        ) : (
          <DoubleMarkUnit />
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function SingleMarkerUnit({
  marker,
  unit,
  marks,
}: {
  marker: ReaderDTO;
  unit: UnitOfAssessmentDTO;
  marks: MarkingSubmissionDTO;
}) {
  // if (admin) {
  //   return (
  //     <Fragment>
  //       <SingleMarkDisplay />;
  //       <Separator orientation="horizontal" />
  //       <OverrideMarks />
  //     </Fragment>
  //   );
  // }
  // if (requiresMarking) {
  // return <UoaMarkingForm />;
  // }
  return <SingleMarkDisplay marker={marker} unit={unit} marks={marks} />;
}

function DoubleMarkUnit() {
  return <div>double</div>;
  // if (!admin && requiresMarking) {
  //   return <UoaMarkingForm />;
  // }

  // return (
  //   <div>
  //     <DoubleMarkDisplay />
  //     {pending ? (
  //       <Fragment />
  //     ) : (
  //       <Fragment>
  //         <Separator orientation="horizontal" />
  //         <SummarySection />
  //       </Fragment>
  //     )}
  //   </div>
  // );
}

function UoaMarkingForm() {
  return (
    <div>form</div>
    // <Form>
    //   <form></form>
    // </Form>
  );
}

function SingleMarkDisplay({
  marker,
  unit,
  marks,
}: {
  marker: ReaderDTO;
  unit: UnitOfAssessmentDTO;
  marks: MarkingSubmissionDTO;
}) {
  // return <div>single mark display</div>;
  return (
    <div>
      <header>
        <p>Marker: {marker.name}</p>
        {/* {admin && dataPresent && <ResetMarksButton />} */}
      </header>
      {unit.components.map((comp) => (
        <MarkingComponentDisplay
          key={comp.id}
          title={comp.title}
          description={comp.description}
          result={marks.marks[comp.id]}
        />
      ))}
    </div>
  );
}

function MarkingComponentDisplay({
  title,
  description,
  result: { mark, justification },
}: {
  title: string;
  description: string;
  result: { mark: number; justification: string };
}) {
  return (
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
      <p>{mark}</p>
      <p>{justification}</p>
    </div>
  );
}

function DoubleMarkDisplay() {
  return (
    <div>
      {/* <SingleMarkDisplay /> */}
      <Separator orientation="vertical" />
      {/* <SingleMarkDisplay /> */}
    </div>
  );
}
