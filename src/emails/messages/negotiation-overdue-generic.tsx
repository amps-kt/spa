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
          Negotiation Overdue:
        </Heading>
        <Text className="mx-auto text-center">
          This is a reminder that you have outstanding project negotiations to
          resolve.
        </Text>
        <Text className="mx-auto text-center">
          Once resolved, the supervisor should upload the resolution via the
          project marking system.
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
MarkingOverdueGeneric.makeSubject = () => "Negotiation Overdue";

export default MarkingOverdueGeneric;
