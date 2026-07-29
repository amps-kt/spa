export interface EmailJob {
  text: string;
  html: string;
  subject: string;
  to: string[];
  cc?: string[];
}

export const EMAIL_QUEUE_NAME = "EMAIL_QUEUE";
