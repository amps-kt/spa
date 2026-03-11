-- Add column with default so existing rows survive
ALTER TABLE "flag" ADD COLUMN "layout_index" INTEGER NOT NULL DEFAULT 0;

-- Set actual values for known flags
UPDATE "flag" SET "layout_index" = 0 WHERE "id" = '2d01a47d-9d7d-4081-8045-cf97bbcf9092';
UPDATE "flag" SET "layout_index" = 1 WHERE "id" = '423eef7b-1247-47a0-859c-52291e6a423b';
UPDATE "flag" SET "layout_index" = 2 WHERE "id" = 'f680b24f-e202-44de-8ea7-6e13ebeed507';
UPDATE "flag" SET "layout_index" = 3 WHERE "id" = 'DEFAULT';
UPDATE "flag" SET "layout_index" = 0 WHERE "id" = 'L4';
UPDATE "flag" SET "layout_index" = 1 WHERE "id" = 'L4_JH';
UPDATE "flag" SET "layout_index" = 2 WHERE "id" = 'SEYP';
UPDATE "flag" SET "layout_index" = 3 WHERE "id" = 'L5';
UPDATE "flag" SET "layout_index" = 4 WHERE "id" = 'L5_JH';

-- Drop the default
ALTER TABLE "flag" ALTER COLUMN "layout_index" DROP DEFAULT;
