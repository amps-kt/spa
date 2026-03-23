import { Grade } from "@/logic/grading";
import { Column, Row, Heading, Section, Text } from "@react-email/components";
import { Markdown } from "@react-email/components";

import { type FullMarkingSubmissionDTO } from "@/dto";
import { type MarkingComponentDTO } from "@/dto";

import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { FormatPercent } from "@/lib/formatting/percent";

function MarkingComponentDisplay({
  title,
  description,
  weight,
  result: { mark, justification },
}: {
  title: string;
  description: string;
  weight: number;
  result: { mark: number; justification: string };
}) {
  return (
    <Section className="rounded-lg border border-solid border-border bg-card text-card-foreground shadow-xs mb-3">
      <CardHeader className="p-4">
        <span className="flex justify-between items-baseline">
          <CardTitle className="text-lg m-0">{title}</CardTitle>
          <CardDescription className="text-muted-foreground m-0">
            (weight: {FormatPercent(weight)})
          </CardDescription>
        </span>
        {description && (
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <Section className="p-4 pt-0">
        <Section className="bg-muted text-muted-foreground rounded-md border border-transparent p-2">
          <Row>
            <Column className="align-top">
              <Text className="font-semibold text-primary text-lg mr-4">
                {Grade.toLetter(mark)}
              </Text>
            </Column>
            <Column>
              <Markdown>{justification}</Markdown>
            </Column>
          </Row>
        </Section>
      </Section>
    </Section>
  );
}

export function Marksheet({
  submission,
  components,
}: {
  submission: FullMarkingSubmissionDTO;
  components: MarkingComponentDTO[];
}) {
  const totalWeight = components.reduce((acc, val) => acc + val.weight, 0);

  return (
    <>
      {components.map(({ title, id, description, weight }) => {
        const result = submission.marks[id];

        return (
          <MarkingComponentDisplay
            key={id}
            title={title}
            description={description}
            weight={weight / totalWeight}
            result={result}
          />
        );
      })}

      <div className="my-4 px-4">
        <Heading as="h3" className="text-lg font-semibold my-4">
          Overall:
        </Heading>
        <Section>
          <Row>
            <Column style={{ verticalAlign: "top" }}>
              <Text className="font-semibold text-primary text-lg mr-4">
                {Grade.toLetter(submission.grade)}
              </Text>
            </Column>
            <Column>
              <Markdown>{submission.finalComment ?? ""}</Markdown>
            </Column>
          </Row>
        </Section>
      </div>
    </>
  );
}
