/*
  Warnings:

  - You are about to drop the column `comment` on the `unit_of_assessment_grade` table. All the data in the column will be lost.
  - You are about to drop the column `grade` on the `unit_of_assessment_grade` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `unit_of_assessment_grade` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "consensus_method" ADD VALUE 'NEGOTIATED_MODERATED';

-- AlterEnum
ALTER TYPE "consensus_stage" ADD VALUE 'MODERATE_AFTER_NEGOTIATION';

-- AlterTable
ALTER TABLE "algorithm" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();


-- CreateTable
CREATE TABLE "grade_entry" (
    "unit_of_assessment_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "method" "consensus_method" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_entry_id" PRIMARY KEY ("unit_of_assessment_id","student_id","method")
);


INSERT INTO "grade_entry" ("comment", "grade", "method", "unit_of_assessment_id", "student_id", "timestamp")
SELECT "comment", "grade", "method", "unit_of_assessment_id", "student_id", NOW()
FROM "unit_of_assessment_grade";

-- AddForeignKey
ALTER TABLE "grade_entry" ADD CONSTRAINT "uoa_grade_entry" FOREIGN KEY ("unit_of_assessment_id", "student_id") REFERENCES "unit_of_assessment_grade"("unit_of_assessment_id", "student_id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- AlterTable
ALTER TABLE "unit_of_assessment_grade" DROP COLUMN "comment",
DROP COLUMN "grade",
DROP COLUMN "method";