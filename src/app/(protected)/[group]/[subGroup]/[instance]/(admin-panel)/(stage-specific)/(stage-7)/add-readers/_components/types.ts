import { type z } from "zod";

import { type Reader } from "@/data-objects";

export type NewReader = z.infer<typeof Reader.newCSVSchema>;
