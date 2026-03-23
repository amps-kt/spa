import { type ReactNode } from "react";

import { type PageName } from "@/config/pages";

import { AppInstanceLink as Link } from "@/lib/routing";

import { cn } from "../utils";

import { mkHref, type LinkArgs } from ".";

export function AppLink<T extends PageName>({
  page,
  linkArgs,
  disabled = false,
  children,
  className,
}: {
  page: T;
  linkArgs: LinkArgs<T>;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  if (disabled) return <div className={cn(className)}>{children}</div>;
  return (
    <Link className={cn(className)} href={mkHref(page, linkArgs)}>
      {children}
    </Link>
  );
}
