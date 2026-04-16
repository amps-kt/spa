import { type ReactNode } from "react";

import { formatDate } from "date-fns";
import Link from "next/link";

import { type PageName } from "@/config/pages";

import { cn } from "../utils";

import { mkHref, type LinkArgs } from ".";

export function CsvLink<T extends PageName>({
  page,
  linkArgs,
  disabled = false,
  children,
  className,
  title,
}: {
  page: T;
  // TODO: this should really live in Pages
  title: string;
  linkArgs: LinkArgs<T>;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}) {
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
