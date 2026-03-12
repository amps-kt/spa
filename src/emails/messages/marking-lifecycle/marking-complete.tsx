import { EmailLink } from "@/emails/components/email-link";
import { Layout } from "@/emails/components/layout";
import { Marksheet } from "@/emails/components/marksheet";
import {
  fakeDissertationUnit,
  fakeParams,
  fakeProject,
  fakeStudent,
  fakeSupervisor,
  fakeSupervisorSubmission,
} from "@/emails/fake-data";
import { Grade } from "@/logic/grading";
import {
  Column,
  Heading,
  Row,
  Section,
  Text,
  Hr,
} from "@react-email/components";

import {
  type UnitGradeDTO,
  type ProjectDTO,
  type StudentDTO,
  type UnitOfAssessmentDTO,
  type FullMarkingSubmissionDTO,
  type UserDTO,
} from "@/dto";

import { ConsensusMethodBadge } from "@/components/ui/badges/consensus-method-badge";

import { type InstanceParams } from "@/lib/validations/params";

interface Props {
  params: InstanceParams;
  student: StudentDTO;
  project: ProjectDTO;
  unit: UnitOfAssessmentDTO;
  unitGrade: UnitGradeDTO;
  supervisor?: { user: UserDTO; submission: FullMarkingSubmissionDTO };
  reader?: { user: UserDTO; submission: FullMarkingSubmissionDTO };
}

export function MarkingComplete({
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
      previewText={`Marking complete for ${student.name} - ${unit.title}`}
    >
      <Section>
        <Heading as="h2" className="mx-auto text-center">
          {unit.title} Marking Complete:
        </Heading>

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

        <Row className="">
          <Column>Final Grade:</Column>
          <Column className="text-right">
            {Grade.toLetter(unitGrade.grades[0].grade)}
          </Column>
        </Row>
        <Row className="mb-[20px]">
          <Column>Consensus by:</Column>
          <Column className="text-right">
            <ConsensusMethodBadge
              method={unitGrade.grades[0].method}
              tooltip={false}
            />
          </Column>
        </Row>

        <Text className="mx-auto text-center italic underline">
          No further action required
        </Text>
      </Section>

      <Hr />
      <Section className="mb-[32px] mt-[32px] text-center">
        <EmailLink
          page="marksheet"
          variant="button"
          linkArgs={{ ...params, studentId: student.id }}
        >
          View marks online
        </EmailLink>
      </Section>

      <Text>A full copy of the marks can be found below.</Text>

      {supervisor && (
        <>
          <Heading as="h4">
            Marked by {supervisor.user.name} ({supervisor.user.email}) -
            Supervisor:
          </Heading>
          <Marksheet
            submission={supervisor.submission}
            components={unit.components}
          />
          <Hr />
        </>
      )}

      {reader && (
        <>
          <Heading as="h4">
            Marked by {reader.user.name} ({reader.user.email}) - Reader:
          </Heading>
          <Marksheet
            submission={reader.submission}
            components={unit.components}
          />
          <Hr />
        </>
      )}

      <Heading as="h4">Grading history (newest first):</Heading>
      <Section className="mb-[20px]">
        {unitGrade.grades.map((g, i) => (
          <Row key={i} className="mb-2">
            <Column className="align-top">
              {Grade.toLetter(g.grade) + "\n"}
            </Column>
            <Column className="align-top px-5">{g.comment}</Column>
            <Column className="align-top text-right">
              <ConsensusMethodBadge method={g.method} tooltip={false} />
            </Column>
          </Row>
        ))}
      </Section>
    </Layout>
  );
}

MarkingComplete.PreviewProps = {
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
      { grade: Grade.toInt("B1"), method: "AUTO", timestamp: new Date() },
    ],
  },
  supervisor: { submission: fakeSupervisorSubmission, user: fakeSupervisor },
  // reader: { submission: fakeReaderSubmission, user: fakeReader },
} satisfies Props;

export default MarkingComplete;
