-- AlterTable
ALTER TABLE "marking_component_submission" ALTER COLUMN "allocation_group_id" DROP DEFAULT,
ALTER COLUMN "allocation_instance_id" DROP DEFAULT,
ALTER COLUMN "allocation_sub_group_id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "unit_of_assessment_grade" ALTER COLUMN "allocation_group_id" DROP DEFAULT,
ALTER COLUMN "allocation_instance_id" DROP DEFAULT,
ALTER COLUMN "allocation_sub_group_id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "unit_of_assessment_submission" ALTER COLUMN "allocation_group_id" DROP DEFAULT,
ALTER COLUMN "allocation_instance_id" DROP DEFAULT,
ALTER COLUMN "allocation_sub_group_id" DROP DEFAULT;
