"use client";

import { AlertTriangle, Info } from "lucide-react";

import {
  type ManualAllocationStudent,
  ValidationWarningSeverity,
} from "./manual-allocation-types";

export function WarningsDisplay({
  warnings,
}: {
  warnings: ManualAllocationStudent["warnings"];
}) {
  const errorWarnings = warnings.filter(
    (w) => w.severity === ValidationWarningSeverity.ERROR,
  );
  const warningMessages = warnings.filter(
    (w) => w.severity === ValidationWarningSeverity.WARNING,
  );

  return (
    <div className="space-y-2">
      {errorWarnings.length > 0 && (
        <div className="space-y-2">
          {errorWarnings.map((warning, index) => (
            <div
              key={index}
              className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <span className="text-sm text-red-800">{warning.message}</span>
            </div>
          ))}
        </div>
      )}

      {warningMessages.length > 0 && (
        <div className="space-y-2">
          {warningMessages.map((warning, index) => (
            <div
              key={index}
              className="flex items-start gap-2 rounded-md border border-orange-200 bg-orange-50 p-3"
            >
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
              <span className="text-sm text-orange-800">{warning.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
