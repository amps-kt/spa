import { type ReactNode } from "react";

import { type ClassValue } from "clsx";

import { type PageName } from "@/config/pages";

import {
  AppInstanceLink,
  type InstancePopulated,
  type LinkArgs,
} from "@/lib/routing";
import { cn } from "@/lib/utils";

import { buttonVariants } from "../ui/button";

export function SideButton<T extends PageName>({
  page,
  linkArgs,
  children: title,
  className,
}: {
  page: T;
  linkArgs: InstancePopulated<LinkArgs<T>>;
  children: ReactNode;
  className?: ClassValue;
}) {
  return (
    <AppInstanceLink
      page={page}
      linkArgs={linkArgs}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "w-full",
        className,
      )}
    >
      {title}
    </AppInstanceLink>
  );
}
