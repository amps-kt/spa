import { PAGES } from "@/config/pages";

import { buttonVariants } from "@/components/ui/button";

import { AppInstanceLink } from "@/lib/routing";
import { cn } from "@/lib/utils";

export function MyPreferencesButton() {
  return (
    <AppInstanceLink
      page="myPreferences"
      linkArgs={{}}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "flex h-full w-34 text-nowrap items-center gap-2 self-end py-3 text-xs",
      )}
    >
      {PAGES.myPreferences.title}
    </AppInstanceLink>
  );
}
