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
import {
  Column,
  Row,
  Heading,
  Section,
  Text,
  Hr,
} from "@react-email/components";

import {
  type FullMarkingSubmissionDTO,
  type ProjectDTO,
  type StudentDTO,
  type UnitOfAssessmentDTO,
  type UserDTO,
} from "@/dto";

import { type InstanceParams } from "@/lib/validations/params";

interface Props {
  params: InstanceParams;
  student: StudentDTO;
  project: ProjectDTO;
  marker: UserDTO;
  unit: UnitOfAssessmentDTO;
  submission: FullMarkingSubmissionDTO;
}

export function MarkingReceipt({
  params,
  student,
  project,
  marker,
  unit,
  submission,
}: Props) {
  return (
    <Layout previewText={`Marks submitted for ${student.name} - ${unit.title}`}>
      <Section>
        <Heading as="h2" className="mx-auto text-center">
          {unit.title} Marks Submitted:
        </Heading>

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

        <Text className="mx-auto text-center italic underline">
          No further action required
        </Text>
      </Section>
      <Hr />
      <Section className="mb-[32px] mt-[32px] text-center">
        <EmailLink
          page="marksheet"
          linkArgs={{ ...params, studentId: student.id }}
          variant="button"
        >
          View marks on marksheet page
        </EmailLink>
      </Section>
      <Heading>A full copy can be found below:</Heading>

      <Marksheet submission={submission} components={unit.components} />
    </Layout>
  );
}

MarkingReceipt.PreviewProps = {
  params: fakeParams,
  student: fakeStudent,
  project: fakeProject,
  marker: fakeSupervisor,
  unit: fakeDissertationUnit,
  submission: fakeSupervisorSubmission,
} satisfies Props;

export default MarkingReceipt;
