/*
  Warnings:

  - You are about to drop the column `caminho_arquivo` on the `documentos_terapeuta` table. All the data in the column will be lost.
  - Added the required column `download_url` to the `documentos_terapeuta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `view_url` to the `documentos_terapeuta` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `documentos_terapeuta` DROP FOREIGN KEY `fk_documentos_terapeuta_terapeuta1`;

-- AlterTable
ALTER TABLE `documentos_terapeuta` DROP COLUMN `caminho_arquivo`,
    ADD COLUMN `download_url` VARCHAR(191) NOT NULL,
    ADD COLUMN `view_url` VARCHAR(191) NOT NULL,
    MODIFY `terapeuta_id` VARCHAR(191) NOT NULL,
    MODIFY `tipo_documento` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `documentos_terapeuta` ADD CONSTRAINT `fk_documentos_terapeuta_terapeuta1` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
