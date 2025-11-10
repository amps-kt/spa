import { redirect as nextRedirect, type RedirectType } from "next/navigation";

import { type PageName } from "@/config/pages";

import { type InstanceParams } from "../validations/params";

import { type LinkArgs, mkHref } from ".";

export function redirect<T extends PageName>(
  page: T,
  linkArgs: LinkArgs<T>,
  type?: RedirectType,
) {
  return nextRedirect(mkHref(page, linkArgs), type);
}

type RedirectArgs = { params?: InstanceParams; next?: string };

export function forbidden(args?: RedirectArgs) {
  return redirect("forbidden", args);
}

export function unauthorised(args?: RedirectArgs) {
  return redirect("unauthorised", args);
}
