export const PAUL_EMAIL = "Paul.Harvey@glasgow.ac.uk";

export function tag_coordinator(subject: string, email?: string) {
  return `[Coordinator] ${email ? email + " " : ""}${subject}`;
}
