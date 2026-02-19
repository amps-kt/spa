import { type UserDTO, type UnitOfAssessmentDTO } from "@/dto";
import {
  type MarkingSubmissionDTO,
  type UnitGradeDTO,
  UnitGradingLifecycleState,
} from "@/dto/marking";

import { ConsensusStage, ConsensusMethod } from "@/db/types";

export class Grading {
  public static getUnitStatus(
    unit: UnitOfAssessmentDTO,
    grade: UnitGradeDTO | undefined,
    submissions: MarkingSubmissionDTO[],
    perspectiveUser?: UserDTO,
  ): UnitGradingLifecycleState {
    if (!unit.isOpen) {
      return UnitGradingLifecycleState.CLOSED;
    } else if (grade?.status === ConsensusStage.MODERATE) {
      return UnitGradingLifecycleState.IN_MODERATION;
    } else if (grade?.status === ConsensusStage.NEGOTIATE) {
      return UnitGradingLifecycleState.IN_NEGOTIATION;
    } else if (grade?.status === ConsensusStage.RESOLVED) {
      if (grade.method === ConsensusMethod.AUTO) {
        return UnitGradingLifecycleState.AUTO_RESOLVED;
      } else if (grade.method === ConsensusMethod.MODERATED) {
        return UnitGradingLifecycleState.RESOLVED_BY_MODERATION;
      } else if (grade.method === ConsensusMethod.NEGOTIATED) {
        return UnitGradingLifecycleState.RESOLVED_BY_NEGOTIATION;
      } else if (grade.method === "OVERRIDE") {
        return UnitGradingLifecycleState.DONE;
      }
    }

    // grade.status === pending

    if (submissions.length === 0) {
      return UnitGradingLifecycleState.REQUIRES_MARKING;
    }

    // #submissions > 0

    if (perspectiveUser) {
      const selfSubmitted = submissions.some(
        (x) => perspectiveUser.id === x.markerId,
      );
      if (!selfSubmitted) return UnitGradingLifecycleState.REQUIRES_MARKING;
      else return UnitGradingLifecycleState.PENDING_2ND_MARKER;
    }

    // At least 1 submission; not done -> need 2nd mark
    return UnitGradingLifecycleState.PENDING_2ND_MARKER;
  }
}
