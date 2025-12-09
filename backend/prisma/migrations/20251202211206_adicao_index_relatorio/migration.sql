/*
  Warnings:

  - You are about to drop the column `pdf_url` on the `relatorio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `relatorio` DROP COLUMN `pdf_url`,
    ADD COLUMN `area` VARCHAR(191) NOT NULL DEFAULT 'fonoaudiologia';

-- CreateIndex
CREATE INDEX `relatorio_clienteId_area_idx` ON `relatorio`(`clienteId`, `area`);

-- CreateIndex
CREATE INDEX `relatorio_area_idx` ON `relatorio`(`area`);
