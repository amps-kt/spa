import { EmailLink } from "@/emails/components/email-link";
import { Layout } from "@/emails/components/layout";
import { Marksheet } from "@/emails/components/marksheet";
import {
  fakeParams,
  fakeStudent,
  fakeProject,
  fakeDissertationUnit,
  fakeSupervisorSubmission,
  fakeSupervisor,
  fakeReaderSubmission,
  fakeReader,
} from "@/emails/fake-data";
import { Grade } from "@/logic/grading";
import {
  Column,
  Heading,
  Hr,
  Row,
  Section,
  Text,
} from "@react-email/components";

import {
  type FullMarkingSubmissionDTO,
  type ProjectDTO,
  type StudentDTO,
  type UnitGradeDTO,
  type UnitOfAssessmentDTO,
  type UserDTO,
} from "@/dto";

import { type InstanceParams } from "@/lib/validations/params";

interface Props {
  params: InstanceParams;
  student: StudentDTO;
  project: ProjectDTO;
  unit: UnitOfAssessmentDTO;
  unitGrade: UnitGradeDTO;
  supervisor: { user: UserDTO; submission: FullMarkingSubmissionDTO };
  reader: { user: UserDTO; submission: FullMarkingSubmissionDTO };
  isSupervisor: boolean;
}

export function NegotiationRequired({
  params,
  student,
  project,
  unit,
  supervisor,
  reader,
  isSupervisor,
}: Props) {
  return (
    <Layout
      previewText={`Negotiation required for ${student.name} - ${unit.title}`}
    >
      <Section>
        <Heading as="h2" className="mx-auto text-center">
          Negotiation Required:
        </Heading>

        <Text className="mx-auto text-center">
          The grades submitted by the supervisor and reader cannot be resolved
          automatically and <strong>require negotiation</strong>.
        </Text>

        <Row>
          <Column>Student: </Column>
          <Column className="text-right">
            {student.name} ({student.id})
          </Column>
        </Row>

        <Row>
          <Column>Project: </Column>
          <Column className="text-right">{project.title}</Column>
        </Row>

        <Row>
          <Column>Assessment Unit: </Column>
          <Column className="text-right">{unit.title}</Column>
        </Row>
        <Row>
          <Column>Supervisor: </Column>
          <Column className="text-right">{supervisor.user.name}</Column>
        </Row>
        <Row>
          <Column>Reader: </Column>
          <Column className="text-right">{reader.user.name}</Column>
        </Row>
      </Section>

      <Text className="mx-auto text-center italic underline">
        The supervisor and reader should now negotiate an outcome.
      </Text>
      <Text className="mx-auto text-center">
        After negotiation, <strong>the supervisor</strong> must input the
        resolution in the online platform. The existing marks can be viewed on
        the marksheet page. A full copy can also be found below.
      </Text>

      <Section className="mb-[32px] mt-[32px] text-center">
        <EmailLink
          page="marksheet"
          linkArgs={{ ...params, studentId: student.id }}
          variant="button"
        >
          {isSupervisor
            ? "Submit resolution or view marks online"
            : "View marks online"}
        </EmailLink>
      </Section>
      <Hr />

      <Heading as="h4">
        Marked by {supervisor.user.name} ({supervisor.user.email}) - Supervisor:
      </Heading>
      <Marksheet
        submission={supervisor.submission}
        components={unit.components}
      />
      <Hr />

      <Heading as="h4">
        Marked by {reader.user.name} ({reader.user.email}) - Reader:
      </Heading>
      <Marksheet submission={reader.submission} components={unit.components} />
    </Layout>
  );
}

NegotiationRequired.PreviewProps = {
  params: fakeParams,
  student: fakeStudent,
  project: fakeProject,
  unit: fakeDissertationUnit,
  unitGrade: {
    status: "RESOLVED",
    studentSubmitted: true,
    grades: [
      {
        grade: Grade.toInt("A1"),
        comment:
          "Third marker agreed this is an exceptional project, and here is some more text to make it wrap in the email.",
        method: "MODERATED",
        timestamp: new Date(),
      },
      {
        grade: Grade.toInt("A1"),
        comment: "Agreed this is a great project, should be considered for A1",
        method: "NEGOTIATED",
        timestamp: new Date(),
      },
      {
        grade: Grade.toInt("B1"),
        comment: "Agreed this is a great project, should be considered for A1",
        method: "AUTO",
        timestamp: new Date(),
      },
    ],
  },
  supervisor: { submission: fakeSupervisorSubmission, user: fakeSupervisor },
  reader: { submission: fakeReaderSubmission, user: fakeReader },
  isSupervisor: true,
} satisfies Props;

NegotiationRequired.makeSubject = ({
  student,
  unit,
}: Omit<Props, "isSupervisor">) =>
  `Negotiation required for ${student.name} - ${unit.title}`;

export default NegotiationRequired;
