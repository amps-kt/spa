"use client";

import { type ReactNode } from "react";

import Link from "next/link";

import { type PageName } from "@/config/pages";

import { type InstancePopulated, type LinkArgs, useInstanceHref } from ".";

/**
 * Can only be called *within* an instance.
 *
 * Behaves almost exactly the same as `AppLink`, but populates
 * the instance params with those from the current instance.
 * These defaults can be overridden if you provide alternatives
 *
 * @param props
 * @returns
 */
export function AppInstanceLink<T extends PageName>({
  page,
  linkArgs,
  disabled = false,
  children,
}: {
  page: T;
  linkArgs: InstancePopulated<LinkArgs<T>>;
  disabled?: boolean;
  children?: ReactNode;
}) {
  const mkHref = useInstanceHref();

  if (disabled) return <div>{children}</div>;
  return <Link href={mkHref(page, linkArgs)}>{children}</Link>;
}
