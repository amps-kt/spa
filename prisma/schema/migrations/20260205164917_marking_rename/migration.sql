/*
  Warnings:

*/
-- RenameTable
ALTER TABLE "assessment_criterion"
RENAME TO "marking_component";

-- RenameTable
ALTER TABLE "criterion_score"
RENAME TO "marking_component_submission";

-- RenameTable
ALTER TABLE "assessment_marking_submission"
RENAME TO "unit_of_assessment_submission";

-- RenameTable
ALTER TABLE "final_unit_of_assessment_grade"
RENAME TO "unit_of_assessment_grade";
