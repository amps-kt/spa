-- Clean data

DELETE
FROM marking_component_submission AS mcs
WHERE NOT EXISTS (
  SELECT 1
  FROM student_details AS sd
  WHERE sd.user_id = mcs.student_id
  AND sd.allocation_group_id = 'socs'
  AND sd.allocation_sub_group_id = 'lvl-4-and-lvl-5-honours'
  AND sd.allocation_instance_id = '2024-2025'
);

DELETE
FROM unit_of_assessment_grade AS uoag
WHERE NOT EXISTS (
  SELECT 1
  FROM student_details AS sd
  WHERE sd.user_id = uoag.student_id
  AND sd.allocation_group_id = 'socs'
  AND sd.allocation_sub_group_id = 'lvl-4-and-lvl-5-honours'
  AND sd.allocation_instance_id = '2024-2025'
);

DELETE
FROM unit_of_assessment_submission AS uoas
WHERE NOT EXISTS (
  SELECT 1
  FROM student_details AS sd
  WHERE sd.user_id = uoas.student_id
  AND sd.allocation_group_id = 'socs'
  AND sd.allocation_sub_group_id = 'lvl-4-and-lvl-5-honours'
  AND sd.allocation_instance_id = '2024-2025'
);


-- AlterTable
ALTER TABLE "marking_component_submission" ADD COLUMN     "allocation_group_id" TEXT NOT NULL DEFAULT 'socs',
ADD COLUMN     "allocation_instance_id" TEXT NOT NULL DEFAULT '2024-2025',
ADD COLUMN     "allocation_sub_group_id" TEXT NOT NULL DEFAULT 'lvl-4-and-lvl-5-honours';

-- AlterTable
ALTER TABLE "unit_of_assessment_grade" ADD COLUMN     "allocation_group_id" TEXT NOT NULL DEFAULT 'socs',
ADD COLUMN     "allocation_instance_id" TEXT NOT NULL DEFAULT '2024-2025',
ADD COLUMN     "allocation_sub_group_id" TEXT NOT NULL DEFAULT 'lvl-4-and-lvl-5-honours';

-- AlterTable
ALTER TABLE "unit_of_assessment_submission" ADD COLUMN     "allocation_group_id" TEXT NOT NULL DEFAULT 'socs',
ADD COLUMN     "allocation_instance_id" TEXT NOT NULL DEFAULT '2024-2025',
ADD COLUMN     "allocation_sub_group_id" TEXT NOT NULL DEFAULT 'lvl-4-and-lvl-5-honours';

-- AddForeignKey
ALTER TABLE "marking_component_submission" ADD CONSTRAINT "component_submission_student" FOREIGN KEY ("student_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "student_details"("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_of_assessment_submission" ADD CONSTRAINT "component_submission_student" FOREIGN KEY ("student_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "student_details"("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_of_assessment_grade" ADD CONSTRAINT "component_submission_student" FOREIGN KEY ("student_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "student_details"("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE RESTRICT ON UPDATE CASCADE;
