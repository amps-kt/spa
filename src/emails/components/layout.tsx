import { type ReactNode } from "react";

import { env } from "@/env";
import {
  Heading,
  Img,
  Text,
  Tailwind,
  Row,
  Section,
  Html,
  Column,
  Head,
  Body,
  Preview,
  Container,
  Hr,
} from "@react-email/components";

export function Layout({
  previewText,
  children,
}: {
  previewText: string;
  children?: ReactNode;
}) {
  return (
    <Html>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                ["background"]: "hsl(0 0% 100%)",
                ["foreground"]: "hsl(222.2 47.4% 11.2%)",

                ["primary"]: "hsl(207 100% 20%)",
                ["primary-foreground"]: "hsl(210 40% 96.1%)",

                ["secondary"]: "hsl(207 100% 30%)",
                ["secondary-foreground"]: "hsl(210 40% 96.1%)",

                ["accent"]: "hsl(210 40% 96.1%)",
                ["accent-foreground"]: "hsl(207 100% 20%)",

                ["destructive"]: "hsl(0 100% 40%)",
                ["destructive-foreground"]: "hsl(210 40% 98%)",

                ["muted"]: "hsl(210 40% 96.1%)",
                ["muted-foreground"]: "hsl(215.4 16.3% 46.9%)",

                ["card"]: "hsl(0 0% 100%)",
                ["card-foreground"]: "hsl(222.2 47.4% 11.2%)",

                ["popover"]: "hsl(0 0% 100%)",
                ["popover-foreground"]: "hsl(222.2 47.4% 11.2%)",

                ["border"]: "hsl(214.3 31.8% 91.4%)",

                ["input"]: "hsl(214.3 31.8% 91.4%)",
                ["input-dark"]: "hsl(215 25% 27%)",

                ["ring"]: "hsl(215 20.2% 65.1%)",
              },
            },
          },
        }}
      >
        <Head />

        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Preview>{previewText}</Preview>

          <Container className="mx-auto my-[40px] max-w-[800px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section>
              <Row>
                <Column>
                  <Img
                    width={150}
                    height={50}
                    src={`${env.FRONTEND_SERVER_URL}/uofg.png`}
                    alt="u-of-g logo"
                  />
                </Column>
                <Column>
                  <Heading as="h3" className="text-right">
                    SPA
                  </Heading>
                </Column>
              </Row>
            </Section>
            {children}
            <Hr />
            <Section>
              <Text className="text-center italic text-gray-400">
                This email was generated automatically - please do not reply to
                this directly. For technical issue/bug email
                compsci-spa-support@glasgow.ac.uk. For all other project-related
                enquiries, email the coordinators, Level 4:
                Paul.Harvey@glasgow.ac.uk Level 5:
                Yiannis.Giannakopoulos@glasgow.ac.uk
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
