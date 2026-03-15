// TODO kill this file, replace with other stuff.
import { Heading, Section, Text } from "@react-email/components";

import { type InstanceParams } from "@/lib/validations/params";

import { EmailLink } from "../components/email-link";
import { Layout } from "../components/layout";
import { fakeParams } from "../fake-data";

interface Props {
  params: InstanceParams;
}

export function MarkingOverdueGeneric({ params }: Props) {
  return (
    <Layout previewText="Marking Overdue">
      <Section>
        <Heading as="h2" className="mx-auto text-center">
          Marking Overdue
        </Heading>

        <Text>
          This is a reminder that the marking upload deadline for Level 4 & SEYP
          Projects has now <strong>past</strong>. You are receiving this email
          as you have overdue marks. In particular for supervisors, please
          remember that you need to submit the{" "}
          <u>conduct and presentation marks</u>, as well as the dissertation
          marks. As negotiation may also be required for projects, your support
          is appreciated.
        </Text>
        <Section className="mb-[32px] mt-[32px] text-center">
          <EmailLink variant="button" page="myMarking" linkArgs={params}>
            View My Marking
          </EmailLink>
        </Section>
      </Section>
    </Layout>
  );
}

MarkingOverdueGeneric.PreviewProps = { params: fakeParams } satisfies Props;

MarkingOverdueGeneric.makeSubject = () => "Marking Overdue";

export default MarkingOverdueGeneric;
