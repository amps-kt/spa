"use client";

import { createContext, useContext } from "react";

import { type ReaderQuotaWarning } from "./manual-allocation-types";

interface WarningContextValue {
  getReaderQuotaWarning: (readerId: string) => ReaderQuotaWarning | undefined;
}

const WarningContext = createContext<WarningContextValue | null>(null);

export function WarningProvider({
  children,
  getReaderQuotaWarning,
}: {
  children: React.ReactNode;
  getReaderQuotaWarning: (readerId: string) => ReaderQuotaWarning | undefined;
}) {
  return (
    <WarningContext.Provider value={{ getReaderQuotaWarning }}>
      {children}
    </WarningContext.Provider>
  );
}

export function useWarningContext() {
  const context = useContext(WarningContext);
  if (!context) {
    throw new Error("useWarningContext must be used within a WarningProvider");
  }
  return context;
}
