/*
  Warnings:

  - fixed

*/
-- CreateEnum
CREATE TYPE "MarkingStatus" AS ENUM ('PENDING', 'DONE', 'MODERATE', 'NEGOTIATE');

-- CreateEnum
CREATE TYPE "MarkingMethod" AS ENUM ('AUTO', 'OVERRIDE', 'NEGOTIATED', 'MODERATED');

-- CreateEnum
CREATE TYPE "FinalGradeMethod" AS ENUM ('AUTO', 'OVERRIDE');

-- DropForeignKey
ALTER TABLE "criterion_score" DROP CONSTRAINT "score_criterion";

-- AlterTable
ALTER TABLE "criterion_score"

RENAME COLUMN "assessment_component_id" to "marking_component_id";

-- AlterTable
ALTER TABLE "final_grade" ADD COLUMN     "comment" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "method" "FinalGradeMethod" NOT NULL DEFAULT 'AUTO';

-- AlterTable
ALTER TABLE "final_unit_of_assessment_grade" ADD COLUMN     "custom_due_date" TIMESTAMP(3),
ADD COLUMN     "custom_weight" INTEGER,
ADD COLUMN     "method" "MarkingMethod" NOT NULL DEFAULT 'AUTO',
ADD COLUMN     "status" "MarkingStatus" NOT NULL DEFAULT 'DONE',
ADD COLUMN     "submitted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "student_details" ADD COLUMN     "enrolled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "unit_of_assessment"
RENAME COLUMN "student_submission_deadline" to "default_student_submission_deadline";

ALTER TABLE "unit_of_assessment"
RENAME COLUMN "weight" to "default_weight";

-- RenameForeignKey
ALTER TABLE "assessment_criterion" RENAME CONSTRAINT "criterion_unit" TO "marking_component_uoa";

-- RenameForeignKey
ALTER TABLE "assessment_marking_submission" RENAME CONSTRAINT "submission_unit" TO "uoa_submission_uoa";

-- RenameForeignKey
ALTER TABLE "criterion_score" RENAME CONSTRAINT "score_submission" TO "marking_component_submission_uoa_submission";

-- RenameForeignKey
ALTER TABLE "unit_of_assessment" RENAME CONSTRAINT "unit_instance" TO "uoa_instance";

-- AddForeignKey
ALTER TABLE "criterion_score" ADD CONSTRAINT "marking_component_submission_marking_component" FOREIGN KEY ("marking_component_id") REFERENCES "assessment_criterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
