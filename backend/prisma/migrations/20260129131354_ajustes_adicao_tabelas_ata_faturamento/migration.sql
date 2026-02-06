/*
  Warnings:

  - You are about to drop the column `external_id` on the `ata_anexo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ata_reuniao_id]` on the table `ata_anexo` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `ata_anexo` DROP FOREIGN KEY `ata_anexo_ata_reuniao_id_fkey`;

-- DropIndex
DROP INDEX `ata_anexo_ata_reuniao_id_external_id_key` ON `ata_anexo`;

-- AlterTable
ALTER TABLE `ata_anexo` DROP COLUMN `external_id`;

-- AlterTable
ALTER TABLE `ata_reuniao` MODIFY `finalidade` ENUM('orientacao_parental', 'reuniao_equipe', 'reuniao_outro_especialista', 'reuniao_escola', 'supervisao_at', 'supervisao_terapeuta', 'supervisao_recebida', 'desenvolvimento_materiais', 'outros') NOT NULL;

-- AlterTable
ALTER TABLE `faturamento` ADD COLUMN `ata_id` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ata_anexo_ata_reuniao_id_key` ON `ata_anexo`(`ata_reuniao_id`);

-- AddForeignKey
ALTER TABLE `faturamento` ADD CONSTRAINT `faturamento_ata_id_fkey` FOREIGN KEY (`ata_id`) REFERENCES `ata_reuniao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
