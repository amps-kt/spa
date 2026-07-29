import { EmailLink } from "@/emails/components/email-link";
import { Layout } from "@/emails/components/layout";
import { fakeParams, fakeProject, fakeStudent } from "@/emails/fake-data";
import { Section, Heading, Row, Text, Column } from "@react-email/components";

import { type ProjectDTO, type StudentDTO } from "@/dto";

import { type InstanceParams } from "@/lib/validations/params";

interface Props {
  params: InstanceParams;
  student: StudentDTO;
  project: ProjectDTO;
}

export function StudentWithdrawn({ params, student, project }: Props) {
  return (
    <Layout previewText={`Student withdrawn - ${student.name}`}>
      <Section>
        <Heading as="h2" className="mx-auto text-center">
          Student Withdrawn
        </Heading>

        <Text className="mx-auto text-center">
          You are receiving this email because a student you are responsible for
          marking will no longer participate in an individual project. There
          will be <strong>no marking required</strong>.
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

StudentWithdrawn.PreviewProps = {
  params: fakeParams,
  student: fakeStudent,
  project: fakeProject,
} satisfies Props;

StudentWithdrawn.makeSubject = ({ student }: Props) =>
  `Student withdrawn - ${student.name}`;

export default StudentWithdrawn;
