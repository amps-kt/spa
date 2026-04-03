import { env } from "@/env";
import { Queue, Worker, type Job } from "bullmq";
import nodemailer from "nodemailer";

import { EMAIL_QUEUE_NAME, type EmailJob } from "./config";
import { connection } from "./redis-connection";

const emailQueue = new Queue<EmailJob>(EMAIL_QUEUE_NAME, { connection });

void emailQueue.setGlobalRateLimit(
  env.MAIL_RATE_LIMIT,
  env.MAIL_RATE_LIMIT_PERIOD,
);

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
  async (job: Job<EmailJob>) => await transporter.sendMail(job.data),
  { connection },
);

void mailWorker.run();
