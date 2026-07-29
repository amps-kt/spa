import { type ReactNode } from "react";

import { env } from "@/env";
import { Link } from "@react-email/components";
import { cva, type VariantProps } from "class-variance-authority";

import { type PageName } from "@/config/pages";

import { cn } from "@/lib/utils";

import {
  type InstancePopulated,
  type LinkArgs,
  mkHref,
} from "../../lib/routing";

const emailLinkVariants = cva("", {
  variants: {
    variant: {
      default: "",
      button:
        "rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline",
    },
  },
  defaultVariants: { variant: "default" },
});

export function EmailLink<T extends PageName>({
  page,
  linkArgs,
  children,
  className,
  variant,
}: {
  page: T;
  linkArgs: InstancePopulated<LinkArgs<T>>;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
} & VariantProps<typeof emailLinkVariants>) {
  return (
    <Link
      href={`${env.FRONTEND_SERVER_URL}${mkHref(page, linkArgs)}`}
      className={cn(emailLinkVariants({ variant }), className)}
    >
      {children}
    </Link>
  );
}
