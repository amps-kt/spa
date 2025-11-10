/*
  Warnings:

  - The primary key for the `flag_on_project` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropIndex
DROP INDEX "user_email_key";

-- AlterTable
ALTER TABLE "flag" RENAME CONSTRAINT "flag_pkey" TO "flag_id";

-- AlterTable
ALTER TABLE "flag_on_project" DROP CONSTRAINT "flag_on_project_pkey",
ADD CONSTRAINT "flag_on_project_id" PRIMARY KEY ("flag_id", "project_id");

-- RenameForeignKey
ALTER TABLE "flag_on_project" RENAME CONSTRAINT "flag_on_project_flag" TO "flag_project_flag";

-- RenameForeignKey
ALTER TABLE "flag_on_project" RENAME CONSTRAINT "flag_on_project_project" TO "flag_project_project";

-- AddForeignKey
ALTER TABLE "flag_on_project" ADD CONSTRAINT "allocation_instance" FOREIGN KEY ("allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "allocation_instance"("allocation_group_id", "allocation_sub_group_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;
