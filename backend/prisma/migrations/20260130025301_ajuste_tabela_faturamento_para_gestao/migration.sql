/*
  Warnings:

  - Added the required column `cliente_id` to the `faturamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `faturamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `terapeuta_id` to the `faturamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `faturamento` ADD COLUMN `cliente_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `motivo_rejeicao` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('pendente', 'aprovado', 'rejeitado') NOT NULL,
    ADD COLUMN `terapeuta_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `valor_ajuda_custo` DECIMAL(10, 2) NULL;

-- AddForeignKey
ALTER TABLE `ata_anexo` ADD CONSTRAINT `ata_anexo_ata_reuniao_id_fkey` FOREIGN KEY (`ata_reuniao_id`) REFERENCES `ata_reuniao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
