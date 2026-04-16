-- AddForeignKey
ALTER TABLE "final_grade" ADD CONSTRAINT "final_grade_student_id_allocation_group_id_allocation_sub__fkey" FOREIGN KEY ("student_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "student_details"("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE RESTRICT ON UPDATE CASCADE;
