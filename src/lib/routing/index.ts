import { useCallback } from "react";

import { type PageName, PAGES } from "@/config/pages";

import { useInstanceParams } from "@/components/params-context";

import { type InstanceParams } from "../validations/params";

export type LinkArgs<T extends PageName> = Parameters<
  (typeof PAGES)[T]["mkUrl"]
>[0];

type LinkFactory<T extends PageName> = (_: LinkArgs<T>) => string;

export type InstancePopulated<T> = Omit<T, keyof InstanceParams> &
  Partial<InstanceParams>;

export function mkHref<T extends PageName>(type: T, linkArgs: LinkArgs<T>) {
  return (PAGES[type].mkUrl as LinkFactory<T>)(linkArgs);
}

export function useInstanceHref() {
  const params = useInstanceParams();

  const mkInstanceHref = useCallback(
    <T extends PageName>(type: T, linkArgs: InstancePopulated<LinkArgs<T>>) => {
      return (PAGES[type].mkUrl as LinkFactory<T>)({ ...params, ...linkArgs });
    },
    [params],
  );

  return mkInstanceHref;
}

export { AppLink } from "./link";
export { AppInstanceLink } from "./instance-link";
export { useAppRouter } from "./router";
export { useAppInstanceRouter } from "./instance-router";
export { redirect } from "./redirect";
