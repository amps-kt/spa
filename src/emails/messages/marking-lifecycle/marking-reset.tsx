import { EmailLink } from "@/emails/components/email-link";
import { Layout } from "@/emails/components/layout";
import {
  fakeDissertationUnit,
  fakeParams,
  fakeProject,
  fakeStudent,
  fakeSupervisor,
} from "@/emails/fake-data";
import { Column, Heading, Row, Section, Text } from "@react-email/components";

import {
  type UnitOfAssessmentDTO,
  type ProjectDTO,
  type StudentDTO,
  type UserDTO,
} from "@/dto";

import { type InstanceParams } from "@/lib/validations/params";

interface Props {
  params: InstanceParams;
  unit: UnitOfAssessmentDTO;
  marker: UserDTO;
  student: StudentDTO;
  project: ProjectDTO;
}

export function MarkingReset({
  params,
  unit,
  marker,
  student,
  project,
}: Props) {
  return (
    <Layout previewText={`Marking reset for ${student.name} - ${unit.title}`}>
      <Section>
        <Heading as="h2" className="mx-auto text-center">
          {unit.title} Marks Reset
        </Heading>

        <Text className="mx-auto text-center">
          This email is to inform you that{" "}
          <strong>an admin has reset your marks</strong>.
        </Text>

        <Row>
          <Column>Marker: </Column>
          <Column className="text-right">
            {marker.name} ({marker.email})
          </Column>
        </Row>

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
      </Section>

      <Text className="mx-auto text-center">
        If marking is still required, you may now re-enter your marks on the
        marksheet page.
      </Text>
      <Section className="mb-[32px] mt-[32px] text-center">
        <EmailLink
          page="marksheet"
          linkArgs={{ ...params, studentId: student.id }}
          variant="button"
        >
          Open marksheet page
        </EmailLink>
      </Section>
    </Layout>
  );
}

MarkingReset.PreviewProps = {
  params: fakeParams,
  student: fakeStudent,
  project: fakeProject,
  marker: fakeSupervisor,
  unit: fakeDissertationUnit,
} satisfies Props;

export default MarkingReset;
