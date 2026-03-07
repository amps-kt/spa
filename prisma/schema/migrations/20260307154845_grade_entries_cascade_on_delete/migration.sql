-- DropForeignKey
ALTER TABLE "grade_entry" DROP CONSTRAINT "uoa_grade_entry";

-- AddForeignKey
ALTER TABLE "grade_entry" ADD CONSTRAINT "uoa_grade_entry" FOREIGN KEY ("unit_of_assessment_id", "student_id") REFERENCES "unit_of_assessment_grade"("unit_of_assessment_id", "student_id") ON DELETE CASCADE ON UPDATE CASCADE;
