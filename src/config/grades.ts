import {
  type AutoResolveResult,
  GradingResult,
  type ModerationCheckResult,
} from "@/dto/result/grading-result";

export const GRADES = [
  { label: "A1", value: 22 },
  { label: "A2", value: 21 },
  { label: "A3", value: 20 },
  { label: "A4", value: 19 },
  { label: "A5", value: 18 },
  { label: "B1", value: 17 },
  { label: "B2", value: 16 },
  { label: "B3", value: 15 },
  { label: "C1", value: 14 },
  { label: "C2", value: 13 },
  { label: "C3", value: 12 },
  { label: "D1", value: 11 },
  { label: "D2", value: 10 },
  { label: "D3", value: 9 },
  { label: "E1", value: 8 },
  { label: "E2", value: 7 },
  { label: "E3", value: 6 },
  { label: "F1", value: 5 },
  { label: "F2", value: 4 },
  { label: "F3", value: 3 },
  { label: "G1", value: 2 },
  { label: "G2", value: 1 },
  { label: "H", value: 0 },
];

export class Grade {
  // POLICY how should we round non-integer grades?
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
    return grade < this.toInt("D3");
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
}
