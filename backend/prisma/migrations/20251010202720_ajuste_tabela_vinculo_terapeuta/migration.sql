/*
  Warnings:

  - You are about to drop the column `atuacao_coterapeuta` on the `terapeuta_cliente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `terapeuta_cliente` DROP COLUMN `atuacao_coterapeuta`,
    ADD COLUMN `area_atuacao` VARCHAR(191) NULL;
