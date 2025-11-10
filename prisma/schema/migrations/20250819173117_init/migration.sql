-- CreateEnum
CREATE TYPE "algorithm_flag" AS ENUM ('MAXSIZE', 'GEN', 'GRE', 'MINCOST', 'MINSQCOST', 'LSB');

-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('SETUP', 'PROJECT_SUBMISSION', 'STUDENT_BIDDING', 'PROJECT_ALLOCATION', 'ALLOCATION_ADJUSTMENT', 'ALLOCATION_PUBLICATION', 'READER_BIDDING', 'READER_ALLOCATION', 'MARK_SUBMISSION', 'GRADE_PUBLICATION');

-- CreateEnum
CREATE TYPE "AllocationMethod" AS ENUM ('PRE_ALLOCATED', 'ALGORITHMIC', 'MANUAL', 'RANDOM');

-- CreateEnum
CREATE TYPE "preference_type" AS ENUM ('SHORTLIST', 'PREFERENCE');

-- CreateEnum
CREATE TYPE "MarkerType" AS ENUM ('SUPERVISOR', 'READER');

-- CreateTable
CREATE TABLE "algorithm" (
    "id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "target_modifier" INTEGER NOT NULL DEFAULT 0,
    "upper_bound_modifier" INTEGER NOT NULL DEFAULT 0,
    "max_rank" INTEGER NOT NULL DEFAULT -1,
    "flag_1" "algorithm_flag" NOT NULL,
    "flag_2" "algorithm_flag",
    "flag_3" "algorithm_flag",
    "builtIn" BOOLEAN NOT NULL DEFAULT false,
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,
    "allocation_instance_id" TEXT NOT NULL,

    CONSTRAINT "algorithm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matching_result" (
    "id" TEXT NOT NULL,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "profile" INTEGER[],
    "degree" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "cost" INTEGER NOT NULL,
    "cost_sq" INTEGER NOT NULL,
    "max_lec_abs_diff" INTEGER NOT NULL,
    "sum_lec_abs_diff" INTEGER NOT NULL,
    "ranks" INTEGER[],
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,
    "allocation_instance_id" TEXT NOT NULL,
    "algorithm_config_id" TEXT NOT NULL,

    CONSTRAINT "matching_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matching_pair" (
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "student_ranking" INTEGER NOT NULL,
    "matching_result_id" TEXT NOT NULL,
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,
    "allocation_instance_id" TEXT NOT NULL,

    CONSTRAINT "matching_pair_pkey" PRIMARY KEY ("user_id","matching_result_id")
);

-- CreateTable
CREATE TABLE "allocation_group" (
    "id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,

    CONSTRAINT "allocation_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocation_sub_group" (
    "id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "allocation_group_id" TEXT NOT NULL,

    CONSTRAINT "sub_group_id" PRIMARY KEY ("allocation_group_id","id")
);

-- CreateTable
CREATE TABLE "allocation_instance" (
    "id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "stage" "Stage" NOT NULL DEFAULT 'SETUP',
    "selected_alg_id" TEXT,
    "project_submission_deadline" TIMESTAMP(3) NOT NULL,
    "supervisor_allocation_access" BOOLEAN NOT NULL DEFAULT false,
    "min_student_preferences" INTEGER NOT NULL,
    "max_student_preferences" INTEGER NOT NULL,
    "max_student_preferences_per_supervisor" INTEGER NOT NULL,
    "student_preference_submission_deadline" TIMESTAMP(3) NOT NULL,
    "student_allocation_access" BOOLEAN NOT NULL DEFAULT false,
    "min_reader_preferences" INTEGER NOT NULL,
    "max_reader_preferences" INTEGER NOT NULL,
    "reader_preference_submission_deadline" TIMESTAMP(3) NOT NULL,
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,

    CONSTRAINT "instance_id" PRIMARY KEY ("allocation_group_id","allocation_sub_group_id","id")
);

-- CreateTable
CREATE TABLE "flag" (
    "id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,
    "allocation_instance_id" TEXT NOT NULL,

    CONSTRAINT "flag_pkey" PRIMARY KEY ("id","allocation_group_id","allocation_sub_group_id","allocation_instance_id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,
    "allocation_instance_id" TEXT NOT NULL,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reader_draft_preference" (
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "type" "preference_type" NOT NULL,
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,
    "allocation_instance_id" TEXT NOT NULL,

    CONSTRAINT "reader_draft_preference_pkey" PRIMARY KEY ("project_id","user_id","allocation_group_id","allocation_sub_group_id","allocation_instance_id")
);

-- CreateTable
CREATE TABLE "reader_submitted_preference" (
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,
    "allocation_instance_id" TEXT NOT NULL,

    CONSTRAINT "reader_submitted_preference_id" PRIMARY KEY ("project_id","user_id")
);

-- CreateTable
CREATE TABLE "unit_of_assessment" (
    "id" TEXT NOT NULL,
    "flag_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "open" BOOLEAN NOT NULL DEFAULT false,
    "student_submission_deadline" TIMESTAMP(3) NOT NULL,
    "marker_submission_deadline" TIMESTAMP(3) NOT NULL,
    "weight" INTEGER NOT NULL,
    "allowedMarkerTypes" "MarkerType"[],
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,
    "allocation_instance_id" TEXT NOT NULL,

    CONSTRAINT "unit_of_assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_criterion" (
    "id" TEXT NOT NULL,
    "unit_of_assessment_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "layout_index" INTEGER NOT NULL,

    CONSTRAINT "assessment_criterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_marking_submission" (
    "summary" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "recommended_for_prize" BOOLEAN NOT NULL DEFAULT false,
    "draft" BOOLEAN NOT NULL,
    "marker_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "unit_of_assessment_id" TEXT NOT NULL,

    CONSTRAINT "assessment_marking_submission_pkey" PRIMARY KEY ("marker_id","student_id","unit_of_assessment_id")
);

-- CreateTable
CREATE TABLE "criterion_score" (
    "marker_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "unit_of_assessment_id" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "justification" TEXT NOT NULL,
    "assessment_component_id" TEXT NOT NULL,

    CONSTRAINT "criterion_score_pkey" PRIMARY KEY ("marker_id","student_id","assessment_component_id")
);

-- CreateTable
CREATE TABLE "final_unit_of_assessment_grade" (
    "unit_of_assessment_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,

    CONSTRAINT "final_unit_of_assessment_grade_pkey" PRIMARY KEY ("student_id","unit_of_assessment_id")
);

-- CreateTable
CREATE TABLE "final_grade" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,
    "allocation_instance_id" TEXT NOT NULL,

    CONSTRAINT "final_grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "extra_information" TEXT,
    "latest_edit_date_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "capacity_lower_bound" INTEGER NOT NULL,
    "capacity_upper_bound" INTEGER NOT NULL,
    "pre_allocated_student_id" TEXT,
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,
    "allocation_instance_id" TEXT NOT NULL,
    "supervisor_id" TEXT NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_draft_preference" (
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "type" "preference_type" NOT NULL,
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,
    "allocation_instance_id" TEXT NOT NULL,

    CONSTRAINT "student_draft_preference_pkey" PRIMARY KEY ("project_id","user_id","allocation_group_id","allocation_sub_group_id","allocation_instance_id")
);

-- CreateTable
CREATE TABLE "submitted_preference" (
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,
    "allocation_instance_id" TEXT NOT NULL,

    CONSTRAINT "student_submitted_preference_id" PRIMARY KEY ("project_id","user_id")
);

-- CreateTable
CREATE TABLE "student_project_allocation" (
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "student_ranking" INTEGER NOT NULL,
    "allocationMethod" "AllocationMethod" NOT NULL DEFAULT 'ALGORITHMIC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,
    "allocation_instance_id" TEXT NOT NULL,

    CONSTRAINT "student_project_allocation_id" PRIMARY KEY ("user_id","allocation_group_id","allocation_sub_group_id","allocation_instance_id")
);

-- CreateTable
CREATE TABLE "reader_project_allocation" (
    "reader_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "third_marker" BOOLEAN NOT NULL DEFAULT false,
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,
    "allocation_instance_id" TEXT NOT NULL,

    CONSTRAINT "reader_project_allocation_id" PRIMARY KEY ("reader_id","user_id","allocation_group_id","allocation_sub_group_id","allocation_instance_id")
);

-- CreateTable
CREATE TABLE "flag_on_project" (
    "flag_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,
    "allocation_instance_id" TEXT NOT NULL,

    CONSTRAINT "flag_on_project_pkey" PRIMARY KEY ("flag_id","project_id","allocation_group_id","allocation_sub_group_id","allocation_instance_id")
);

-- CreateTable
CREATE TABLE "tag_on_project" (
    "tag_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,

    CONSTRAINT "tag_on_project_id" PRIMARY KEY ("tag_id","project_id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_details" (
    "latest_submission_date_time" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,
    "allocation_instance_id" TEXT NOT NULL,
    "flagId" TEXT NOT NULL,

    CONSTRAINT "student_details_id" PRIMARY KEY ("user_id","allocation_group_id","allocation_sub_group_id","allocation_instance_id")
);

-- CreateTable
CREATE TABLE "supervisor_details" (
    "project_allocation_lower_bound" INTEGER NOT NULL,
    "project_allocation_target" INTEGER NOT NULL,
    "project_allocation_upper_bound" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,
    "allocation_instance_id" TEXT NOT NULL,

    CONSTRAINT "supervisor_details_id" PRIMARY KEY ("user_id","allocation_group_id","allocation_sub_group_id","allocation_instance_id")
);

-- CreateTable
CREATE TABLE "reader_details" (
    "project_allocation_lower_bound" INTEGER NOT NULL,
    "project_allocation_target" INTEGER NOT NULL,
    "project_allocation_upper_bound" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,
    "allocation_instance_id" TEXT NOT NULL,

    CONSTRAINT "reader_details_id" PRIMARY KEY ("user_id","allocation_group_id","allocation_sub_group_id","allocation_instance_id")
);

-- CreateTable
CREATE TABLE "user_in_instance" (
    "user_id" TEXT NOT NULL,
    "joined" BOOLEAN NOT NULL DEFAULT false,
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,
    "allocation_instance_id" TEXT NOT NULL,

    CONSTRAINT "user_in_instance_pkey" PRIMARY KEY ("user_id","allocation_group_id","allocation_sub_group_id","allocation_instance_id")
);

-- CreateTable
CREATE TABLE "super_admin" (
    "user_id" TEXT NOT NULL,

    CONSTRAINT "super_admin_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "group_admin" (
    "user_id" TEXT NOT NULL,
    "allocation_group_id" TEXT NOT NULL,

    CONSTRAINT "group_admin_id" PRIMARY KEY ("user_id","allocation_group_id")
);

-- CreateTable
CREATE TABLE "sub_group_admin" (
    "user_id" TEXT NOT NULL,
    "allocation_group_id" TEXT NOT NULL,
    "allocation_sub_group_id" TEXT NOT NULL,

    CONSTRAINT "sub_group_admin_id" PRIMARY KEY ("user_id","allocation_group_id","allocation_sub_group_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "matching_result_algorithm_config_id_key" ON "matching_result"("algorithm_config_id");

-- CreateIndex
CREATE UNIQUE INDEX "allocation_group_display_name_key" ON "allocation_group"("display_name");

-- CreateIndex
CREATE UNIQUE INDEX "allocation_instance_display_name_allocation_group_id_alloca_key" ON "allocation_instance"("display_name", "allocation_group_id", "allocation_sub_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "flag_display_name_allocation_group_id_allocation_sub_group__key" ON "flag"("display_name", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id");

-- CreateIndex
CREATE UNIQUE INDEX "tag_title_allocation_group_id_allocation_sub_group_id_alloc_key" ON "tag"("title", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_criterion_title_unit_of_assessment_id_key" ON "assessment_criterion"("title", "unit_of_assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "final_grade_student_id_allocation_group_id_allocation_sub_g_key" ON "final_grade"("student_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id");

-- CreateIndex
CREATE UNIQUE INDEX "reader_project_allocation_user_id_third_marker_allocation_g_key" ON "reader_project_allocation"("user_id", "third_marker", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "algorithm" ADD CONSTRAINT "algorithm_instance" FOREIGN KEY ("allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "allocation_instance"("allocation_group_id", "allocation_sub_group_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_result" ADD CONSTRAINT "matching_algorithm" FOREIGN KEY ("algorithm_config_id") REFERENCES "algorithm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_result" ADD CONSTRAINT "matching_instance" FOREIGN KEY ("allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "allocation_instance"("allocation_group_id", "allocation_sub_group_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_pair" ADD CONSTRAINT "matching_pair_instance" FOREIGN KEY ("allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "allocation_instance"("allocation_group_id", "allocation_sub_group_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_pair" ADD CONSTRAINT "matching_pair_matching" FOREIGN KEY ("matching_result_id") REFERENCES "matching_result"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_pair" ADD CONSTRAINT "matching_pair_project" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_pair" ADD CONSTRAINT "matching_pair_student" FOREIGN KEY ("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "student_details"("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_sub_group" ADD CONSTRAINT "sub_group_group" FOREIGN KEY ("allocation_group_id") REFERENCES "allocation_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_instance" ADD CONSTRAINT "instance_sub_group" FOREIGN KEY ("allocation_group_id", "allocation_sub_group_id") REFERENCES "allocation_sub_group"("allocation_group_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag" ADD CONSTRAINT "flag_instance" FOREIGN KEY ("allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "allocation_instance"("allocation_group_id", "allocation_sub_group_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_instance" FOREIGN KEY ("allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "allocation_instance"("allocation_group_id", "allocation_sub_group_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reader_draft_preference" ADD CONSTRAINT "reader_draft_preference_project" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reader_draft_preference" ADD CONSTRAINT "reader_draft_preference_reader" FOREIGN KEY ("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "reader_details"("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reader_submitted_preference" ADD CONSTRAINT "reader_preference_project" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reader_submitted_preference" ADD CONSTRAINT "reader_preference_reader" FOREIGN KEY ("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "reader_details"("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_of_assessment" ADD CONSTRAINT "unit_flag" FOREIGN KEY ("flag_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "flag"("id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_of_assessment" ADD CONSTRAINT "unit_instance" FOREIGN KEY ("allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "allocation_instance"("allocation_group_id", "allocation_sub_group_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_criterion" ADD CONSTRAINT "criterion_unit" FOREIGN KEY ("unit_of_assessment_id") REFERENCES "unit_of_assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_marking_submission" ADD CONSTRAINT "submission_unit" FOREIGN KEY ("unit_of_assessment_id") REFERENCES "unit_of_assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterion_score" ADD CONSTRAINT "score_criterion" FOREIGN KEY ("assessment_component_id") REFERENCES "assessment_criterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterion_score" ADD CONSTRAINT "score_submission" FOREIGN KEY ("marker_id", "student_id", "unit_of_assessment_id") REFERENCES "assessment_marking_submission"("marker_id", "student_id", "unit_of_assessment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_unit_of_assessment_grade" ADD CONSTRAINT "final_unit_grade_unit" FOREIGN KEY ("unit_of_assessment_id") REFERENCES "unit_of_assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_grade" ADD CONSTRAINT "final_grade_instance" FOREIGN KEY ("allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "allocation_instance"("allocation_group_id", "allocation_sub_group_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_grade" ADD CONSTRAINT "final_grade_spa" FOREIGN KEY ("student_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "student_project_allocation"("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_instance" FOREIGN KEY ("allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "allocation_instance"("allocation_group_id", "allocation_sub_group_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_preallocated_student" FOREIGN KEY ("pre_allocated_student_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "student_details"("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_supervisor" FOREIGN KEY ("supervisor_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "supervisor_details"("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_draft_preference" ADD CONSTRAINT "student_draft_preference_project" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_draft_preference" ADD CONSTRAINT "student_draft_preference_student" FOREIGN KEY ("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "student_details"("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submitted_preference" ADD CONSTRAINT "student_preference_project" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submitted_preference" ADD CONSTRAINT "student_preference_student" FOREIGN KEY ("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "student_details"("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_project_allocation" ADD CONSTRAINT "spa_project" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_project_allocation" ADD CONSTRAINT "spa_student" FOREIGN KEY ("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "student_details"("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reader_project_allocation" ADD CONSTRAINT "rpa_project" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reader_project_allocation" ADD CONSTRAINT "rpa_reader" FOREIGN KEY ("reader_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "reader_details"("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reader_project_allocation" ADD CONSTRAINT "rpa_student" FOREIGN KEY ("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "student_details"("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag_on_project" ADD CONSTRAINT "flag_on_project_flag" FOREIGN KEY ("flag_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "flag"("id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag_on_project" ADD CONSTRAINT "flag_on_project_project" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_on_project" ADD CONSTRAINT "tag_project_project" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_on_project" ADD CONSTRAINT "tag_project_tag" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_details" ADD CONSTRAINT "student_flag" FOREIGN KEY ("flagId", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "flag"("id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_details" ADD CONSTRAINT "student_user" FOREIGN KEY ("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "user_in_instance"("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisor_details" ADD CONSTRAINT "supervisor_user" FOREIGN KEY ("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "user_in_instance"("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reader_details" ADD CONSTRAINT "reader_user" FOREIGN KEY ("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "user_in_instance"("user_id", "allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_in_instance" ADD CONSTRAINT "instance_user_instance" FOREIGN KEY ("allocation_group_id", "allocation_sub_group_id", "allocation_instance_id") REFERENCES "allocation_instance"("allocation_group_id", "allocation_sub_group_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_in_instance" ADD CONSTRAINT "instance_user_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "super_admin" ADD CONSTRAINT "super_admin_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_admin" ADD CONSTRAINT "group_admin_group" FOREIGN KEY ("allocation_group_id") REFERENCES "allocation_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_admin" ADD CONSTRAINT "group_admin_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_group_admin" ADD CONSTRAINT "sub_group_admin_group" FOREIGN KEY ("allocation_group_id") REFERENCES "allocation_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_group_admin" ADD CONSTRAINT "sub_group_admin_sub_group" FOREIGN KEY ("allocation_group_id", "allocation_sub_group_id") REFERENCES "allocation_sub_group"("allocation_group_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_group_admin" ADD CONSTRAINT "sub_group_admin_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
