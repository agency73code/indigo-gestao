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

-- CreateIndex
CREATE INDEX `ocp_area_idx` ON `ocp`(`area`);

-- CreateIndex
CREATE INDEX `ocp_cliente_id_area_idx` ON `ocp`(`cliente_id`, `area`);

-- CreateIndex
CREATE INDEX `sessao_area_idx` ON `sessao`(`area`);

-- CreateIndex
CREATE INDEX `sessao_ocp_id_area_idx` ON `sessao`(`ocp_id`, `area`);
