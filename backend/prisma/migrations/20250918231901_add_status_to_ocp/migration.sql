/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `cliente` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `ocp` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE UNIQUE INDEX `cliente_id_key` ON `cliente`(`id`);
