-- AlterTable
-- Adiciona coluna area apenas se não existir
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ocp' AND COLUMN_NAME = 'area');

SET @sql_alter = IF(@col_exists = 0,
    'ALTER TABLE `ocp` ADD COLUMN `area` VARCHAR(191) NOT NULL DEFAULT ''terapia-ocupacional''',
    'SELECT ''Column area already exists'' AS msg');

PREPARE stmt FROM @sql_alter;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adiciona coluna desempenho_atual
ALTER TABLE `ocp` ADD COLUMN IF NOT EXISTS `desempenho_atual` TEXT NULL;

-- CreateIndex (se não existirem)
CREATE INDEX IF NOT EXISTS `ocp_area_idx` ON `ocp`(`area`);
CREATE INDEX IF NOT EXISTS `ocp_cliente_id_area_idx` ON `ocp`(`cliente_id`, `area`);