"use client";

import { type ReactNode } from "react";

import { AppInstanceLink as Link } from "@/lib/routing";
import { cn } from "@/lib/utils";

import { usePathInInstance } from "./params-context";

export function InstanceLink({
  disabled = false,
  href,
  children,
  className,
}: {
  disabled?: boolean;
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const { getPath } = usePathInInstance();
  if (disabled) {
    return (
      <div className={cn(`text-indigo-600 hover:text-indigo-800`, className)}>
        {children}
      </div>
    );
  }
  return (
    <Link
      href={getPath(href)}
      className={cn(`text-indigo-600 hover:text-indigo-800`, className)}
    >
      {children}
    </Link>
  );
}
