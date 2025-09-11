import { redirect } from "next/navigation";

import { type InstanceParams } from "../validations/params";

import { formatParamsAsPath } from "./general/get-instance-path";

type RedirectArgs = { params?: InstanceParams; next?: string };

export function forbidden(args?: RedirectArgs) {
  let url = "/forbidden";
  if (args?.next) url += `?next=${args.next}`;

  if (!args?.params) return redirect(url);
  return redirect(`${formatParamsAsPath(args.params)}/${url}`);
}

export function unauthorised(args?: RedirectArgs) {
  let url = "/unauthorised";
  if (args?.next) url += `?next=${args.next}`;

  if (!args?.params) return redirect(url);
  return redirect(`${formatParamsAsPath(args.params)}/${url}`);
}
