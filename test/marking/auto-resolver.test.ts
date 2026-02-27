import { Grade } from "@/logic/grading";
import { assert, integer, property } from "fast-check";
import { describe } from "node:test";
import { expect, test } from "vitest";

import { MIN_PASSING_GRADE } from "@/config/grades";

import { GradingResult } from "@/dto/result/grading-result";

const A1 = Grade.toInt("A1");
const A2 = Grade.toInt("A2");
const A3 = Grade.toInt("A3");
const H = Grade.toInt("H");

const D3 = Grade.toInt(MIN_PASSING_GRADE);

void describe("Autoresolve", () => {
  test("A1 A1 Moderate", () => {
    const res = Grade.autoResolve(A1, A1);

    expect(res.status === GradingResult.MODERATE);
  });

  test("A1 A2 Moderate", () => {
    const res = Grade.autoResolve(A1, A2);

    expect(res.status === GradingResult.MODERATE);
  });

  test("A2 A1 Auto A2", () => {
    const res = Grade.autoResolve(A2, A1);

    expect(res.status === GradingResult.AUTO_RESOLVED && res.grade === A2);
  });

  test("H H Moderate", () => {
    const res = Grade.autoResolve(H, H);

    expect(res.status === GradingResult.MODERATE);
  });

  void describe("properties", () => {
    test("Fail Moderate", () => {
      assert(
        property(integer({ max: D3 - 1 }), (g) => {
          const res = Grade.autoResolve(g, g);

          return res.status === GradingResult.MODERATE;
        }),
      );
    });

    test("Diff +1 always OK", () => {
      assert(
        property(integer({ min: D3, max: A2 }), (grade) => {
          const res = Grade.autoResolve(grade, grade + 1);
          return (
            res.status === GradingResult.AUTO_RESOLVED && res.grade === grade
          );
        }),
      );
    });

    test("Diff -1 always OK", () => {
      assert(
        property(integer({ min: D3, max: A2 }), (grade) => {
          const res = Grade.autoResolve(grade, grade - 1);
          return (
            res.status === GradingResult.AUTO_RESOLVED && res.grade === grade
          );
        }),
      );
    });

    test("Diff +2 OK iff no band diff", () => {
      assert(
        property(integer({ min: D3, max: A3 }), (grade) => {
          const res = Grade.autoResolve(grade, grade + 2);
          if (Grade.haveMajorBandDifference(grade, grade + 2)) {
            return res.status === GradingResult.NEGOTIATE1;
          } else {
            return (
              res.status === GradingResult.AUTO_RESOLVED &&
              res.grade === grade + 1
            );
          }
        }),
      );
    });
  });
});
