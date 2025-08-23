import { redirect as nextRedirect, type RedirectType } from "next/navigation";

import { type PageName } from "@/config/pages";

import { type LinkArgs, mkHref } from ".";

export function redirect<T extends PageName>(
  page: T,
  linkArgs: LinkArgs<T>,
  type?: RedirectType,
) {
  return nextRedirect(mkHref(page, linkArgs), type);
}
