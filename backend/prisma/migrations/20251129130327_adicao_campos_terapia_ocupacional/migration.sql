/*
  Warnings:

  - Added the required column `area` to the `ocp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `area` to the `sessao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `estimulo` ADD COLUMN `descricao` TEXT NULL;

-- AlterTable
ALTER TABLE `estimulo_ocp` ADD COLUMN `descricao` TEXT NULL;

-- AlterTable
ALTER TABLE `ocp` ADD COLUMN `area` VARCHAR(191) NOT NULL,
    ADD COLUMN `desempenho_atual` TEXT NULL;

-- AlterTable
ALTER TABLE `sessao` ADD COLUMN `area` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `sessao_trial` ADD COLUMN `duracao_minutos` INTEGER NULL;

-- CreateTable
CREATE TABLE `sessao_arquivo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessao_id` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `caminho` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `sessao_arquivo_sessao_id_idx`(`sessao_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ocp_area_idx` ON `ocp`(`area`);

-- CreateIndex
CREATE INDEX `ocp_cliente_id_area_idx` ON `ocp`(`cliente_id`, `area`);

-- CreateIndex
CREATE INDEX `sessao_area_idx` ON `sessao`(`area`);

-- CreateIndex
CREATE INDEX `sessao_ocp_id_area_idx` ON `sessao`(`ocp_id`, `area`);

-- AddForeignKey
ALTER TABLE `sessao_arquivo` ADD CONSTRAINT `sessao_arquivo_sessao_id_fkey` FOREIGN KEY (`sessao_id`) REFERENCES `sessao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
