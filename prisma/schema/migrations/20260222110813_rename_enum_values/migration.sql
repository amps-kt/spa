/*
  Warnings:

  - The values [PENDING,DONE] on the enum `consensus_stage` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "consensus_stage" RENAME VALUE 'PENDING' TO 'UNRESOLVED';
ALTER TYPE "consensus_stage" RENAME VALUE 'DONE' TO 'RESOLVED';