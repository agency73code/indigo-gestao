/*
  Warnings:

  - Added the required column `tamanho` to the `sessao_arquivo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `sessao_arquivo` ADD COLUMN `tamanho` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `sessao_trial` ADD COLUMN `descricao_compensacao` VARCHAR(191) NULL,
    ADD COLUMN `descricao_desconforto` VARCHAR(191) NULL,
    ADD COLUMN `teve_compensacao` BOOLEAN NULL,
    ADD COLUMN `teve_desconforto` BOOLEAN NULL,
    ADD COLUMN `utilizou_carga` BOOLEAN NULL,
    ADD COLUMN `valor_carga` VARCHAR(191) NULL;
