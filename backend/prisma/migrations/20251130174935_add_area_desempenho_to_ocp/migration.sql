-- AlterTable
ALTER TABLE `ocp` ADD COLUMN `area` VARCHAR(191) NOT NULL DEFAULT 'terapia-ocupacional',
    ADD COLUMN `desempenho_atual` TEXT NULL;

-- CreateIndex
CREATE INDEX `ocp_area_idx` ON `ocp`(`area`);
CREATE INDEX `ocp_cliente_id_area_idx` ON `ocp`(`cliente_id`, `area`);