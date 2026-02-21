import { z } from "zod";

import { INSTITUTION } from "@/config/institution";

export const isAlphanumeric = (
  errMsg = "Only alphanumeric characters are allowed",
) => z.string().regex(/^[a-zA-Z0-9]+$/, errMsg);

export const institutionIdSchema = z.coerce
  .string<string>(`Please enter a valid ${INSTITUTION.ID_NAME}`)
  .min(1, `Please enter a valid ${INSTITUTION.ID_NAME}`)
  .pipe(
    isAlphanumeric(
      `Only alphanumeric characters are allowed in ${INSTITUTION.ID_NAME}`,
    ),
  );
