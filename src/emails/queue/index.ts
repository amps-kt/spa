import { type ReactElement } from "react";

import { render } from "@react-email/components";
import { Queue } from "bullmq";

import { EMAIL_QUEUE_NAME, type EmailJob } from "./config";
import { getConnection } from "./redis-connection";

let emailQueue: Queue<EmailJob> | undefined;

export function getQueue() {
  emailQueue ??= new Queue<EmailJob>(EMAIL_QUEUE_NAME, {
    connection: getConnection(),
  });

  return emailQueue
}

export function makeQueue() {

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
    const emailQueue = getQueue()

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
