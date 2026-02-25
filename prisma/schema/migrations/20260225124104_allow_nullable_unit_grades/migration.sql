-- AlterTable
ALTER TABLE "unit_of_assessment_grade" ALTER COLUMN "grade" DROP NOT NULL,
ALTER COLUMN "comment" DROP NOT NULL,
ALTER COLUMN "method" DROP NOT NULL;
