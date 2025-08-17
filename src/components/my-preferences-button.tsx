import Link from "next/link";

import { PAGES } from "@/config/pages";

import { buttonVariants } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export function MyPreferencesButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "flex h-full w-34 text-nowrap items-center gap-2 self-end py-3 text-xs",
      )}
    >
      {PAGES.myPreferences.title}
    </Link>
  );
}
