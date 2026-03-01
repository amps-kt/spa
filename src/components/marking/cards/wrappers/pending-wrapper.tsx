import { type ReactNode } from "react";

import { Separator } from "@/components/ui/separator";

export function PendingWrapper({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
      <Separator orientation="horizontal" className="my-5" />
      <div className="my-10">
        <h3 className="text-xl font-semibold">
          The second marker must input their grades for this unit to progress
        </h3>
      </div>
    </div>
  );
}
