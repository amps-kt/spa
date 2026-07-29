import { type ReactElement } from "react";

import { render } from "@react-email/components";
import { Queue } from "bullmq";

import { EMAIL_QUEUE_NAME, type EmailJob } from "./config";
import { makeConnection } from "./redis-connection";

export function makeQueue() {
  const emailQueue = new Queue<EmailJob>(EMAIL_QUEUE_NAME, {
    connection: makeConnection(),
  });

  async function queueEmail({
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

  return queueEmail;
}
