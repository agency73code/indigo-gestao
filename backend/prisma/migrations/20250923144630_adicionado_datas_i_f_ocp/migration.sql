/*
  Warnings:

  - Added the required column `data_fim` to the `ocp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `data_inicio` to the `ocp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ocp` ADD COLUMN `data_fim` DATETIME(3) NOT NULL,
    ADD COLUMN `data_inicio` DATETIME(3) NOT NULL;
