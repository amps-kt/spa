// TODO kill this file, replace with other stuff.
import { Heading, Section, Text } from "@react-email/components";

import { format } from "@/lib/formatting/date";
import { type InstanceParams } from "@/lib/validations/params";

import { EmailLink } from "../components/email-link";
import { Layout } from "../components/layout";
import { fakeParams } from "../fake-data";

interface Props {
  params: InstanceParams;
}

export function MarkingReminder({ params }: Props) {
  return (
    <Layout previewText="Marking Overdue">
      <Section>
        <Heading as="h2" className="mx-auto text-center">
          Marking Reminder
        </Heading>

        <Text className="mx-auto text-center">
          This is a gentle reminder that the marking upload deadline for Level 4
          & SEYP Projects is <strong>{format(new Date())}</strong>.
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

MarkingReminder.PreviewProps = { params: fakeParams } satisfies Props;

export default MarkingReminder;
