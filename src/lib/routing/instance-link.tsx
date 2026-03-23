"use client";

import { type ReactNode } from "react";

import { type PageName } from "@/config/pages";

import { AppInstanceLink as Link } from "@/lib/routing";

import { cn } from "../utils";

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
  className,
}: {
  page: T;
  linkArgs: InstancePopulated<LinkArgs<T>>;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  const mkHref = useInstanceHref();

  if (disabled) return <div className={cn(className)}>{children}</div>;
  return (
    <Link className={cn(className)} href={mkHref(page, linkArgs)}>
      {children}
    </Link>
  );
}
