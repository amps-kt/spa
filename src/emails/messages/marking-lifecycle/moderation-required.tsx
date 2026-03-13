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
  Section,
  Heading,
  Column,
  Hr,
  Row,
  Text,
} from "@react-email/components";

import {
  type StudentDTO,
  type ProjectDTO,
  type UnitOfAssessmentDTO,
  type UnitGradeDTO,
  type UserDTO,
  type FullMarkingSubmissionDTO,
} from "@/dto";

import { ConsensusMethodBadge } from "@/components/ui/badges/consensus-method-badge";

import { type InstanceParams } from "@/lib/validations/params";

interface Props {
  params: InstanceParams;
  student: StudentDTO;
  project: ProjectDTO;
  unit: UnitOfAssessmentDTO;
  unitGrade: UnitGradeDTO;
  supervisor: { user: UserDTO; submission: FullMarkingSubmissionDTO };
  reader: { user: UserDTO; submission: FullMarkingSubmissionDTO };
}

export function ModerationRequired({
  params,
  student,
  project,
  unit,
  unitGrade,
  supervisor,
  reader,
}: Props) {
  return (
    <Layout
      previewText={`Moderation required for ${student.name} - ${unit.title}`}
    >
      <Heading as="h2" className="mx-auto text-center">
        Moderation Required
      </Heading>
      <Text className="mx-auto text-center">
        The marking for this unit requires moderation because it has achieved an
        exceptional grade or negotiation could not be resolved. The coordinator
        has been informed and will arrange moderation.
      </Text>
      <Section>
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
          <Column className="text-right">
            {supervisor.user.name} ({supervisor.user.email})
          </Column>
        </Row>

        <Row>
          <Column>Reader: </Column>
          <Column className="text-right">
            {reader.user.name} ({reader.user.email})
          </Column>
        </Row>
      </Section>
      <Hr />
      <Section className="mb-[32px] mt-[32px] text-center">
        <EmailLink
          page="marksheet"
          linkArgs={{ ...params, studentId: student.id }}
          variant="button"
        >
          View marks online
        </EmailLink>
      </Section>

      <Text>A full copy of the marks can be found below.</Text>

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

      {unitGrade.grades.length > 0 && (
        <>
          <Hr />
          <Heading as="h4">Grading history (newest first):</Heading>
          <Section className="mb-[20px]">
            {unitGrade.grades.map((g, i) => (
              <Row key={i} className="mb-2">
                <Column className="align-top">{Grade.toLetter(g.grade)}</Column>
                <Column className="align-top px-5">{g.comment}</Column>
                <Column className="align-top text-right">
                  <ConsensusMethodBadge tooltip={false} method={g.method} />
                </Column>
              </Row>
            ))}
          </Section>
        </>
      )}
    </Layout>
  );
}

ModerationRequired.PreviewProps = {
  params: fakeParams,
  student: fakeStudent,
  project: fakeProject,
  unit: fakeDissertationUnit,
  unitGrade: {
    status: "RESOLVED",
    studentSubmitted: true,
    grades: [
      {
        grade: Grade.toInt("B1"),
        comment: "Agreed this is a great project, should be considered for A1",
        method: "NEGOTIATED",
        timestamp: new Date(),
      },
      {
        grade: Grade.toInt("B1"),

        method: "AUTO",
        timestamp: new Date(),
      },
    ],
  },
  supervisor: { submission: fakeSupervisorSubmission, user: fakeSupervisor },
  reader: { submission: fakeReaderSubmission, user: fakeReader },
} satisfies Props;

ModerationRequired.makeSubject = ({ student, unit }: Props) =>
  `Moderation required for ${student.name} - ${unit.title}`;

export default ModerationRequired;
