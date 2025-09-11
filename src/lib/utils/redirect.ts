import { redirect } from "next/navigation";

import { type InstanceParams } from "../validations/params";

import { formatParamsAsPath } from "./general/get-instance-path";

export function forbidden(params?: InstanceParams) {
  if (!params) return redirect("/forbidden");
  return redirect(`${formatParamsAsPath(params)}/forbidden`);
}

export function unauthorised(params?: InstanceParams) {
  if (!params) return redirect("/unauthorised");
  return redirect(`${formatParamsAsPath(params)}/unauthorised`);
}
