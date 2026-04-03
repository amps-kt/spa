import { env } from "@/env";
import { Worker, type Job } from "bullmq";
import nodemailer from "nodemailer";

import { EMAIL_QUEUE_NAME, type EmailJob } from "./config";
import { connection } from "./redis-connection";

const transporter = nodemailer.createTransport(
  {
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    auth: env.MAIL_PASSWORD
      ? { user: env.MAIL_USER, pass: env.MAIL_PASSWORD }
      : undefined,
  },
  { from: { address: env.MAIL_USER, name: "SPA Support" } },
);

const mailWorker = new Worker(
  EMAIL_QUEUE_NAME,
  async (job: Job<EmailJob>) => {
    const { to, cc, subject, html, text } = job.data;
    await transporter.sendMail({ to, cc, subject, html, text });
  },
  { connection },
);

void mailWorker.run();
