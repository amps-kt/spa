import { EmailLink } from "@/emails/components/email-link";
import { Layout } from "@/emails/components/layout";
import {
  fakeStudent,
  fakeProject,
  fakePresentationUnit,
  fakeParams,
} from "@/emails/fake-data";
import { Column, Row, Section, Heading, Text } from "@react-email/components";

import {
  type StudentDTO,
  type ProjectDTO,
  type UnitOfAssessmentDTO,
} from "@/dto";

import { type InstanceParams } from "@/lib/validations/params";

interface Props {
  params: InstanceParams;
  student: StudentDTO;
  project: ProjectDTO;
  unit: UnitOfAssessmentDTO;
}

export function MedicalVoidGranted({ student, project, unit, params }: Props) {
  return (
    <Layout
      previewText={`Extension granted for ${student.name} - ${unit.title}`}
    >
      <Section>
        <Heading as="h2" className="mx-auto text-center">
          Medical Void Granted
        </Heading>
        <Text className="mx-auto text-center">
          You are receiving this email because a student you are responsible for
          marking has received a medical void.
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

MedicalVoidGranted.PreviewProps = {
  params: fakeParams,
  student: fakeStudent,
  project: fakeProject,
  unit: fakePresentationUnit,
} satisfies Props;

export default MedicalVoidGranted;
