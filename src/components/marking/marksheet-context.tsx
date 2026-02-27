"use client";

import { createContext, useContext, type ReactNode } from "react";

import { type ReaderDTO, type SupervisorDTO } from "@/dto";

import { type InstanceParams } from "@/lib/validations/params";

interface MarksheetContextType {
  reader: ReaderDTO;
  supervisor: SupervisorDTO;
  studentId: string;
  markerId: string;
  params: InstanceParams;
}

const marksheetContext = createContext<MarksheetContextType | undefined>(
  undefined,
);

export function MarksheetContextProvider({
  reader,
  supervisor,
  studentId,
  markerId,
  params,
  children,
}: { children: ReactNode } & MarksheetContextType) {
  return (
    <marksheetContext.Provider
      value={{ reader, supervisor, studentId, markerId, params }}
    >
      {children}
    </marksheetContext.Provider>
  );
}

export function useMarksheetContext(): MarksheetContextType {
  const data = useContext(marksheetContext);
  if (!data) {
    throw new Error(
      "Cannot use useMarksheetContext outside of marksheetContext",
    );
  }

  return data;
}
