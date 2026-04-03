import { type ReactElement } from "react";

import { render } from "@react-email/components";
import { Queue } from "bullmq";

import { EMAIL_QUEUE_NAME, type EmailJob } from "./config";
import { connection } from "./redis-connection";

const emailQueue = new Queue<EmailJob>(EMAIL_QUEUE_NAME, { connection });

export async function queueEmail({
  message,
  to,
  subject,
  cc,
}: {
  message: ReactElement;
  subject: string;
  to: string[];
  cc?: string[];
}) {
  await emailQueue.add("send-mail", {
    to,
    cc,
    subject,
    html: await render(message),
    text: await render(message, { plainText: true }),
  });
}
