/*
  Warnings:

  - A unique constraint covering the columns `[project_id,allocation_group_id,allocation_sub_group_id,allocation_instance_id]` on the table `reader_project_allocation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "instance_reader_project_allocation" ON "reader_project_allocation"("project_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id");
