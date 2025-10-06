/*
  Warnings:

  - Added the required column `atualizado_em` to the `terapeuta_cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `data_inicio` to the `terapeuta_cliente` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `terapeuta_cliente` DROP FOREIGN KEY `terapeuta_cliente_terapeuta_id_fkey`;

-- DropIndex
DROP INDEX `terapeuta_cliente_terapeuta_id_cliente_id_key` ON `terapeuta_cliente`;

-- AlterTable
ALTER TABLE `terapeuta_cliente` ADD COLUMN `atuacao_coterapeuta` VARCHAR(191) NULL,
    ADD COLUMN `atualizado_em` DATETIME(3) NOT NULL,
    ADD COLUMN `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `data_fim` DATETIME(3) NULL,
    ADD COLUMN `data_inicio` DATETIME(3) NOT NULL,
    ADD COLUMN `observacoes` TEXT NULL,
    ADD COLUMN `papel` VARCHAR(191) NOT NULL DEFAULT 'responsible',
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE INDEX `terapeuta_cliente_terapeuta_id_idx` ON `terapeuta_cliente`(`terapeuta_id`);

-- RedefineIndex
CREATE INDEX `terapeuta_cliente_cliente_id_idx` ON `terapeuta_cliente`(`cliente_id`);
