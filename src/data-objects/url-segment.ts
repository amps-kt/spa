import { PAGES } from "@/config/pages";

import { type Role } from "@/db/types";

// MOVE This feels like the wrong place for this
export class UrlSegment {
  // This name is also bad
  public static isStaticValid(segment: string): boolean {
    const validStaticSegment = new Set(
      Object.values(PAGES)
        .filter((page) => page.level === 4)
        .map((page) => page.href),
    );
    return validStaticSegment.has(segment);
  }

  public static getSegmentRoles(segment: string): Set<Role> {
    return new Set(
      Object.values(PAGES).find((page) => page.href === segment)
        ?.allowedRoles ?? [],
    );
  }

  public static hasSubRoute(segment: string): boolean {
    return (
      Object.values(PAGES).find((page) => page.href === segment)?.hasSubRoute ??
      false
    );
  }
}
