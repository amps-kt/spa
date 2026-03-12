import { EmailLink } from "@/emails/components/email-link";
import { Layout } from "@/emails/components/layout";
import {
  fakeParams,
  fakePresentationUnit,
  fakeProject,
  fakeStudent,
} from "@/emails/fake-data";
import { Heading, Section, Text, Row, Column } from "@react-email/components";

import {
  type UnitGradeDTO,
  type ProjectDTO,
  type StudentDTO,
  type UnitOfAssessmentDTO,
} from "@/dto";

import { getDueDate } from "@/components/marking/cards/u-o-a-card";

import { format } from "@/lib/utils/date/format";
import { type InstanceParams } from "@/lib/validations/params";

interface Props {
  params: InstanceParams;
  student: StudentDTO;
  project: ProjectDTO;
  unit: UnitOfAssessmentDTO;
  unitGrade: UnitGradeDTO;
}

export function ExtensionGranted({
  params,
  student,
  project,
  unit,
  unitGrade,
}: Props) {
  if (unitGrade.customDueDate === undefined)
    throw new Error("Extension granted email requires custom due date");

  return (
    <Layout
      previewText={`Extension granted for ${student.name} - ${unit.title}`}
    >
      <Section>
        <Heading as="h2" className="mx-auto text-center">
          Extension Granted
        </Heading>

        <Text className="mx-auto text-center">
          You are receiving this email because a student you are responsible for
          marking has received a deadline extension. Note that the{" "}
          <strong>marking deadline</strong> has also been extended.
        </Text>

        <Row>
          <Column>Student:</Column>
          <Column className="text-right">
            {student.name} ({student.id})
          </Column>
        </Row>

        <Row>
          <Column>Project:</Column>
          <Column className="text-right">{project.title}</Column>
        </Row>

        <Row>
          <Column>Assessment Unit:</Column>
          <Column className="text-right">{unit.title}</Column>
        </Row>

        <Row>
          <Column>New student deadline:</Column>
          <Column className="text-right">
            {format(unitGrade.customDueDate)}
          </Column>
        </Row>
        <Row>
          <Column>New marking deadline:</Column>
          <Column className="text-right">
            {format(getDueDate(unit, unitGrade))}
          </Column>
        </Row>

        <Text className="mx-auto text-center italic underline">
          No further action required
        </Text>
      </Section>
      <Section className="mb-[32px] mt-[32px] text-center">
        <EmailLink
          page="marksheet"
          variant="button"
          linkArgs={{ ...params, studentId: student.id }}
        >
          View marksheet online
        </EmailLink>
      </Section>
    </Layout>
  );
}

ExtensionGranted.PreviewProps = {
  params: fakeParams,
  student: fakeStudent,
  project: fakeProject,
  unit: fakePresentationUnit,
  unitGrade: {
    status: "UNRESOLVED",
    studentSubmitted: false,
    grades: [],
    customDueDate: new Date(),
  },
} satisfies Props;

export default ExtensionGranted;
