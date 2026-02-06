import z from "zod";

export const UserRole = {
  READER: "READER",
  SUPERVISOR: "SUPERVISOR",
  ADMIN: "ADMIN",
} as const;

export type UserRole = keyof typeof UserRole;

export const UnitMarkingStatus = {
  CLOSED: "CLOSED",
  REQUIRES_MARKING: "REQUIRES_MARKING",
  IN_NEGOTIATION: "IN_NEGOTIATION",
  IN_MODERATION: "IN_MODERATION",
  PENDING_2ND_MARKER: "PENDING_2ND_MARKER",
  DONE: "DONE",
  AUTO_RESOLVED: "AUTO_RESOLVED",
  NEGOTIATED: "NEGOTIATED",
  MODERATED: "MODERATED",
} as const;

export type UnitMarkingStatus = keyof typeof UnitMarkingStatus;

export const unitMarkingStatusSchema = z.enum([
  UnitMarkingStatus.CLOSED,
  UnitMarkingStatus.REQUIRES_MARKING,
  UnitMarkingStatus.IN_NEGOTIATION,
  UnitMarkingStatus.IN_MODERATION,
  UnitMarkingStatus.PENDING_2ND_MARKER,
  UnitMarkingStatus.DONE,
  UnitMarkingStatus.AUTO_RESOLVED,
  UnitMarkingStatus.NEGOTIATED,
  UnitMarkingStatus.MODERATED,
]);

export const OverallMarkingStatus = {
  DONE: "DONE",
  NOT_SUBMITTED: "NOT_SUBMITTED",
  CLOSED: "CLOSED",
  PENDING: "PENDING",
  ACTION_REQUIRED: "ACTION_REQUIRED",
} as const;

export type OverallMarkingStatus = keyof typeof OverallMarkingStatus;

export const overallMarkingStatusSchema = z.enum([
  OverallMarkingStatus.DONE,
  OverallMarkingStatus.NOT_SUBMITTED,
  OverallMarkingStatus.CLOSED,
  OverallMarkingStatus.PENDING,
  OverallMarkingStatus.ACTION_REQUIRED,
]);

export function unitToOverall(stat: UnitMarkingStatus): OverallMarkingStatus {
  const rec: Record<UnitMarkingStatus, OverallMarkingStatus> = {
    [UnitMarkingStatus.CLOSED]: OverallMarkingStatus.CLOSED,
    [UnitMarkingStatus.REQUIRES_MARKING]: OverallMarkingStatus.ACTION_REQUIRED,
    [UnitMarkingStatus.IN_NEGOTIATION]: OverallMarkingStatus.ACTION_REQUIRED,
    [UnitMarkingStatus.IN_MODERATION]: OverallMarkingStatus.PENDING,
    [UnitMarkingStatus.PENDING_2ND_MARKER]: OverallMarkingStatus.PENDING,
    [UnitMarkingStatus.DONE]: OverallMarkingStatus.DONE,
    [UnitMarkingStatus.AUTO_RESOLVED]: OverallMarkingStatus.DONE,
    [UnitMarkingStatus.NEGOTIATED]: OverallMarkingStatus.DONE,
    [UnitMarkingStatus.MODERATED]: OverallMarkingStatus.DONE,
  };

  return rec[stat];
}

export function markingStatusCompare(
  a: OverallMarkingStatus,
  b: OverallMarkingStatus,
): OverallMarkingStatus {
  const rec: Record<OverallMarkingStatus, number> = {
    CLOSED: 4,
    DONE: 3,
    NOT_SUBMITTED: 2,
    PENDING: 1,
    ACTION_REQUIRED: 0,
  };

  return rec[a] < rec[b] ? a : b;
}

export function markingStatusMin(
  s: OverallMarkingStatus[],
): OverallMarkingStatus {
  return s.reduce(markingStatusCompare, OverallMarkingStatus.ACTION_REQUIRED);
}
