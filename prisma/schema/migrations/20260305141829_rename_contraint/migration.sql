-- AlterTable
ALTER TABLE "algorithm" ALTER COLUMN "id" DROP DEFAULT;

-- RenameIndex
ALTER INDEX "final_grade_student_id_allocation_group_id_allocation_sub_g_key" RENAME TO "final_grade_unique";
