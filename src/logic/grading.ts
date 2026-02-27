import { GRADES, MIN_PASSING_GRADE } from "@/config/grades";

import { type UserDTO, type UnitOfAssessmentDTO } from "@/dto";
import {
  type MarkingSubmissionDTO,
  type UnitGradeDTO,
  UnitGradingLifecycleState,
} from "@/dto/marking";
import {
  type ModerationCheckResult,
  GradingResult,
  type AutoResolveResult,
  MarkSubmissionEvent,
  type MarkSubmissionEventResult,
} from "@/dto/result/grading-result";

import { ConsensusStage, ConsensusMethod, MarkerType } from "@/db/types";

export class Grade {
  public static round(mark: number): number {
    return Math.round(mark);
  }

  public static average(grade1: number, grade2: number): number {
    return this.round((grade1 + grade2) / 2);
  }

  public static weightedAverage(
    scores: { score: number; weight: number }[],
  ): number {
    const totalWeight = scores.reduce((acc, val) => acc + val.weight, 0);
    const totalWeightedScore = scores.reduce(
      (acc, val) => acc + val.weight * val.score,
      0,
    );

    const mark = this.round(totalWeightedScore / totalWeight);
    return mark;
  }

  public static toLetter(mark: number): string {
    if (mark !== Math.round(mark)) {
      throw new Error(`Mark must be an integer: ${mark}`);
    }
    const grade = GRADES.find((g) => g.value === mark);
    if (!grade) {
      console.error(`Invalid numerical grade: ${mark}`);
      return `invalid ${mark}`;
    }
    return grade.label;
  }

  public static toInt(grade: string): number {
    const gradeObj = GRADES.find((g) => g.label === grade);
    if (!gradeObj) {
      console.error(`Invalid letter grade: ${grade}`);
      return -1;
    }

    return gradeObj.value;
  }

  public static getMajorBand(numericalGrade: number): string {
    const letterGrade = this.toLetter(numericalGrade);
    return letterGrade[0];
  }

  public static haveMajorBandDifference(
    grade1: number,
    grade2: number,
  ): boolean {
    return this.getMajorBand(grade1) === this.getMajorBand(grade2);
  }

  public static isFailing(grade: number): boolean {
    return grade < this.toInt(MIN_PASSING_GRADE);
  }

  public static isExtreme(grade: number): boolean {
    return grade === this.toInt("A1") || this.isFailing(grade);
  }

  public static checkExtremes(grade: number): ModerationCheckResult {
    if (this.isExtreme(grade)) {
      return { status: GradingResult.MODERATE } as const;
    } else {
      return { status: GradingResult.AUTO_RESOLVED, grade } as const;
    }
  }

  public static autoResolve(
    supervisorGrade: number,
    readerGrade: number,
  ): AutoResolveResult {
    const diff = Math.abs(supervisorGrade - readerGrade);

    if (diff <= 1) {
      return this.checkExtremes(supervisorGrade);
    }

    if (
      diff === 2 &&
      !this.haveMajorBandDifference(supervisorGrade, readerGrade)
    ) {
      return this.checkExtremes(this.average(supervisorGrade, readerGrade));
    }

    if (diff === 2) {
      return { status: GradingResult.NEGOTIATE1 };
    }

    return { status: GradingResult.NEGOTIATE2 };
  }

  public static handleSubmission(
    allowedMarkerTypes: MarkerType[],
    supervisorSubmission?: MarkingSubmissionDTO,
    readerSubmission?: MarkingSubmissionDTO,
  ): MarkSubmissionEventResult {
    if (allowedMarkerTypes.length === 1) {
      const { grade } = (allowedMarkerTypes[0] === MarkerType.SUPERVISOR
        ? supervisorSubmission
        : readerSubmission) ?? { grade: undefined };

      if (grade === undefined) {
        throw new Error("Bad grade type passed to single-marked unit");
      }

      return { status: MarkSubmissionEvent.SINGLE_MARKED, grade };
    }

    // assert(unit.allowedMarkerTypes.length === 2)

    if (!supervisorSubmission || !readerSubmission) {
      return { status: MarkSubmissionEvent.FIRST_OF_TWO };
    }

    if (supervisorSubmission.draft || readerSubmission.draft) {
      return { status: MarkSubmissionEvent.FIRST_OF_TWO };
    }

    return this.autoResolve(supervisorSubmission.grade, readerSubmission.grade);
  }

  public static handleNegotiationResolution(
    grade: number,
  ): ModerationCheckResult {
    return this.checkExtremes(grade);
  }

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

    const validSubmissions = submissions.filter((s) => !s.draft);

    if (validSubmissions.length === 0) {
      return UnitGradingLifecycleState.REQUIRES_MARKING;
    }

    // #validSumbissions > 0

    if (perspectiveUser) {
      const selfSubmitted = validSubmissions.some(
        (x) => perspectiveUser.id === x.markerId,
      );
      if (!selfSubmitted) return UnitGradingLifecycleState.REQUIRES_MARKING;
      else return UnitGradingLifecycleState.PENDING_2ND_MARKER;
    }

    // At least 1 submission; not done -> need 2nd mark
    return UnitGradingLifecycleState.PENDING_2ND_MARKER;
  }
}
