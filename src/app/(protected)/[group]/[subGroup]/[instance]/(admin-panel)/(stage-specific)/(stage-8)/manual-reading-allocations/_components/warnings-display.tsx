import { InfoIcon } from "lucide-react";

import { type ReaderQuotaWarning } from "./manual-allocation-types";

export function WarningsDisplay({ warning }: { warning?: ReaderQuotaWarning }) {
  if (!warning) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2 rounded-md border border-orange-200 bg-orange-50 p-3">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
        <span className="text-sm text-orange-800">{warning.message}</span>
      </div>
    </div>
  );
}
