"use client";

import { createContext, useContext, type ReactNode } from "react";

import { type ReaderDTO, type SupervisorDTO } from "@/dto";

import { type InstanceParams } from "@/lib/validations/params";

export const MarksheetRole = {
  ADMIN: "ADMIN",
  SUPERVISOR: "SUPERVISOR",
  READER: "READER",
  SUPERVISOR_ADMIN: "SUPERVISOR_ADMIN",
  READER_ADMIN: "READER_ADMIN",
} as const;

export type MarksheetRole = keyof typeof MarksheetRole;

interface MarksheetContextType {
  reader: ReaderDTO;
  supervisor: SupervisorDTO;
  studentId: string;
  params: InstanceParams;
  viewerRole: MarksheetRole;
  userId: string;
}

const marksheetContext = createContext<MarksheetContextType | undefined>(
  undefined,
);

export function MarksheetContextProvider({
  reader,
  supervisor,
  studentId,
  params,
  userId,
  isAdmin,
  children,
}: {
  children: ReactNode;
  isAdmin: boolean;
  reader: ReaderDTO;
  supervisor: SupervisorDTO;
  studentId: string;
  params: InstanceParams;
  userId: string;
}) {
  const viewerRole = getViewerRole({ userId, isAdmin, supervisor, reader });

  return (
    <marksheetContext.Provider
      value={{ reader, supervisor, studentId, params, viewerRole, userId }}
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

function getViewerRole({
  userId,
  isAdmin,
  supervisor,
  reader,
}: {
  userId: string;
  isAdmin: boolean;
  supervisor: SupervisorDTO;
  reader: ReaderDTO;
}): MarksheetRole {
  if (userId === supervisor.id) {
    return isAdmin ? MarksheetRole.SUPERVISOR_ADMIN : MarksheetRole.SUPERVISOR;
  }
  if (userId === reader.id) {
    return isAdmin ? MarksheetRole.READER_ADMIN : MarksheetRole.READER;
  }
  if (isAdmin) return MarksheetRole.ADMIN;

  console.log(supervisor, reader);

  throw new Error("User who is not marker or admin can see marksheet page");
}
