/*
  Warnings:

  - You are about to drop the column `project_allocation_lower_bound` on the `reader_details` table. All the data in the column will be lost.
  - You are about to drop the column `project_allocation_target` on the `reader_details` table. All the data in the column will be lost.
  - You are about to drop the column `project_allocation_upper_bound` on the `reader_details` table. All the data in the column will be lost.
  - The primary key for the `reader_project_allocation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `third_marker` on the `reader_project_allocation` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `reader_project_allocation` table. All the data in the column will be lost.
  - The `allocationMethod` column on the `student_project_allocation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `reader_draft_preference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reader_submitted_preference` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `reading_workload_quota` to the `reader_details` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `student_draft_preference` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- RenameEnum
ALTER TYPE "preference_type" RENAME TO "student_preference_type";

-- CreateEnum
ALTER TYPE "AllocationMethod" RENAME TO "allocation_method";

-- CreateEnum
CREATE TYPE "reader_preference_type" AS ENUM ('PREFERRED', 'UNACCEPTABLE');

-- DropForeignKey
ALTER TABLE "reader_draft_preference" DROP CONSTRAINT "reader_draft_preference_project";

-- DropForeignKey
ALTER TABLE "reader_draft_preference" DROP CONSTRAINT "reader_draft_preference_reader";

-- DropForeignKey
ALTER TABLE "reader_project_allocation" DROP CONSTRAINT "rpa_student";

-- DropForeignKey
ALTER TABLE "reader_submitted_preference" DROP CONSTRAINT "reader_preference_project";

-- DropForeignKey
ALTER TABLE "reader_submitted_preference" DROP CONSTRAINT "reader_preference_reader";

-- DropIndex
DROP INDEX "reader_project_allocation_user_id_third_marker_allocation_g_key";

-- AlterTable
ALTER TABLE "reader_details"
RENAME COLUMN "project_allocation_target" TO "reading_workload_quota";

ALTER TABLE "reader_details" 
DROP COLUMN "project_allocation_lower_bound",
DROP COLUMN "project_allocation_upper_bound";

-- AlterTable
ALTER TABLE "reader_project_allocation" DROP CONSTRAINT "reader_project_allocation_id",
DROP COLUMN "third_marker",
DROP COLUMN "user_id",
ADD CONSTRAINT "reader_project_allocation_id" PRIMARY KEY ("reader_id", "project_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id");

-- AlterTable
ALTER TABLE "student_project_allocation" 
RENAME COLUMN "allocationMethod" to "allocation_method";

-- DropTable
DROP TABLE "reader_draft_preference";

-- DropTable
DROP TABLE "reader_submitted_preference";

-- CreateTable
CREATE TABLE "reader_preference" (
    "reader_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "type" "reader_preference_type" NOT NULL,
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,
    "allocation_instance_id" TEXT NOT NULL,

    CONSTRAINT "reader_preference_pkey" PRIMARY KEY ("reader_id","project_id")
);

-- AddForeignKey
ALTER TABLE "reader_preference" ADD CONSTRAINT "reader_preference_project" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reader_preference" ADD CONSTRAINT "reader_preference_reader" FOREIGN KEY ("reader_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "reader_details"("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reader_preference" ADD CONSTRAINT "allocation_instance" FOREIGN KEY ("allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "allocation_instance"("allocation_group_id", "allocation_sub_group_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reader_project_allocation" ADD CONSTRAINT "allocation_instance" FOREIGN KEY ("allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "allocation_instance"("allocation_group_id", "allocation_sub_group_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;
