-- AlterTable
ALTER TABLE "marking_component_submission" ALTER COLUMN "grade" DROP NOT NULL,
ALTER COLUMN "justification" DROP NOT NULL;

-- AlterTable
ALTER TABLE "unit_of_assessment_submission" ALTER COLUMN "summary" DROP NOT NULL,
ALTER COLUMN "grade" DROP NOT NULL;
