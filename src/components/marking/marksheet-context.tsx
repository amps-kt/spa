"use client";

import { createContext, useContext, type ReactNode } from "react";

import { type ReaderDTO, type SupervisorDTO } from "@/dto";

import { type InstanceParams } from "@/lib/validations/params";

interface MarksheetContextType {
  reader: ReaderDTO;
  supervisor: SupervisorDTO;
  studentId: string;
  params: InstanceParams;
}

const marksheetContext = createContext<MarksheetContextType | undefined>(
  undefined,
);

export function MarksheetContextProvider({
  reader,
  supervisor,
  studentId,
  params,
  children,
}: { children: ReactNode } & MarksheetContextType) {
  return (
    <marksheetContext.Provider
      value={{ reader, supervisor, studentId, params }}
    >
      {children}
    </marksheetContext.Provider>
  );
}

export function useMarksheetContext(): MarksheetContextType {
  const data = useContext(marksheetContext);
  if (!data) {
    throw new Error("Cannot use hook outside of context");
  }

  return data;
}
