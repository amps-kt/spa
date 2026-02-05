-- AlterTable
ALTER TABLE "marking_component" RENAME CONSTRAINT "assessment_criterion_pkey" TO "marking_component_pkey";

-- AlterTable
ALTER TABLE "marking_component_submission" RENAME CONSTRAINT "criterion_score_pkey" TO "marking_component_submission_pkey";

-- AlterTable
ALTER TABLE "unit_of_assessment_grade" RENAME CONSTRAINT "final_unit_of_assessment_grade_pkey" TO "unit_of_assessment_grade_pkey";

ALTER TABLE "unit_of_assessment_grade" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "unit_of_assessment_submission" RENAME CONSTRAINT "assessment_marking_submission_pkey" TO "unit_of_assessment_submission_pkey";

-- RenameIndex
ALTER INDEX "assessment_criterion_title_unit_of_assessment_id_key" RENAME TO "marking_component_title_unit_of_assessment_id_key";
