import {
  type UnitOfAssessmentSubmission,
  type UnitOfAssessmentGrade,
} from "@prisma/client";

import { type UserDTO, type UnitOfAssessmentDTO } from "@/dto";
import { UnitMarkingStatus } from "@/dto/marking";

import { DB_unitMarkingStatus, MarkingMethod } from "@/db/types";

export class Grading {
  static getUnitStatus(
    unit: UnitOfAssessmentDTO,
    grade: UnitOfAssessmentGrade | undefined,
    submissions: UnitOfAssessmentSubmission[],
    perspectiveUser?: UserDTO,
  ): UnitMarkingStatus {
    if (!unit.isOpen) {
      return UnitMarkingStatus.CLOSED;
    } else if (grade?.status === DB_unitMarkingStatus.MODERATE) {
      return UnitMarkingStatus.IN_MODERATION;
    } else if (grade?.status === DB_unitMarkingStatus.NEGOTIATE) {
      return UnitMarkingStatus.IN_NEGOTIATION;
    } else if (grade?.status === DB_unitMarkingStatus.DONE) {
      if (grade.method === MarkingMethod.AUTO) {
        return UnitMarkingStatus.AUTO_RESOLVED;
      } else if (grade.method === MarkingMethod.MODERATED) {
        return UnitMarkingStatus.MODERATED;
      } else if (grade.method === MarkingMethod.NEGOTIATED) {
        return UnitMarkingStatus.NEGOTIATED;
      } else if (grade.method === "OVERRIDE") {
        return UnitMarkingStatus.DONE;
      }
    }

    // grade.status === pending

    if (submissions.length === 0) {
      return UnitMarkingStatus.REQUIRES_MARKING;
    }

    // #submissions > 0

    if (perspectiveUser) {
      const selfSubmitted = submissions.some(
        (x) => perspectiveUser.id === x.markerId,
      );
      if (!selfSubmitted) return UnitMarkingStatus.REQUIRES_MARKING;
      else return UnitMarkingStatus.PENDING_2ND_MARKER;
    }

    // At least 1 submission; not done -> need 2nd mark
    return UnitMarkingStatus.PENDING_2ND_MARKER;
  }
}
