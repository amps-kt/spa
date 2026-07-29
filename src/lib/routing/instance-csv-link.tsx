"use client";

import { type ReactNode } from "react";

import { formatDate } from "date-fns";
import Link from "next/link";

import { type PageName } from "@/config/pages";

import { cn } from "../utils";

import { type InstancePopulated, type LinkArgs, useInstanceHref } from ".";

/**
 * Can only be called *within* an instance.
 *
 * Behaves almost exactly the same as `CsvLink`, but populates
 * the instance params with those from the current instance.
 * These defaults can be overridden if you provide alternatives
 *
 * @param props
 * @returns
 */
export function InstanceCsvLink<T extends PageName>({
  page,
  title,
  linkArgs,
  disabled = false,
  children,
  className,
}: {
  page: T;
  // TODO move to pages
  title: string;
  linkArgs: InstancePopulated<LinkArgs<T>>;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  const mkHref = useInstanceHref();

  if (disabled) return <div className={cn(className)}>{children}</div>;
  return (
    <Link
      className={cn(className)}
      href={mkHref(page, linkArgs)}
      target="_blank"
      download={`${title}-${formatDate(Date.now(), "yyyy-MM-dd")}.csv`}
    >
      {children}
    </Link>
  );
}
