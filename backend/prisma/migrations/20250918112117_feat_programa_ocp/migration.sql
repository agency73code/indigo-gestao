-- AlterTable
ALTER TABLE `cliente` ALTER COLUMN `atualizado_em` DROP DEFAULT;

-- AlterTable
ALTER TABLE `cliente_endereco` ALTER COLUMN `atualizado_em` DROP DEFAULT;

-- AlterTable
ALTER TABLE `endereco` ALTER COLUMN `atualizado_em` DROP DEFAULT;

-- AlterTable
ALTER TABLE `escola` ALTER COLUMN `atualizado_em` DROP DEFAULT;

-- AlterTable
ALTER TABLE `escola_endereco` ALTER COLUMN `atualizado_em` DROP DEFAULT;

-- AlterTable
ALTER TABLE `pagamentos` ALTER COLUMN `atualizado_em` DROP DEFAULT;

-- AlterTable
ALTER TABLE `responsaveis` ALTER COLUMN `atualizado_em` DROP DEFAULT;

-- AlterTable
ALTER TABLE `terapeuta` ALTER COLUMN `atualizado_em` DROP DEFAULT;

-- AlterTable
ALTER TABLE `terapeuta_endereco` ALTER COLUMN `atualizado_em` DROP DEFAULT;

-- CreateTable
CREATE TABLE `sessao_trial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessao_id` INTEGER NOT NULL,
    `estimulos_ocp_id` INTEGER NOT NULL,
    `ordem` INTEGER NOT NULL,
    `resultado` VARCHAR(191) NOT NULL,

    INDEX `sessao_trial_sessao_id_idx`(`sessao_id`),
    INDEX `sessao_trial_estimulos_ocp_id_idx`(`estimulos_ocp_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ocp_id` INTEGER NOT NULL,
    `cliente_id` CHAR(36) NOT NULL,
    `terapeuta_id` CHAR(36) NOT NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `sessao_terapeuta_id_data_criacao_idx`(`terapeuta_id`, `data_criacao`),
    INDEX `sessao_ocp_id_idx`(`ocp_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estimulo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estimulo_ocp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_estimulo` INTEGER NOT NULL,
    `id_ocp` INTEGER NOT NULL,
    `nome` VARCHAR(191) NULL,
    `descricao` VARCHAR(191) NULL,
    `status` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ocp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cliente_id` CHAR(36) NOT NULL,
    `criador_id` CHAR(36) NOT NULL,
    `nome_programa` VARCHAR(191) NOT NULL,
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `objetivo_programa` VARCHAR(191) NULL,
    `objetivo_descricao` VARCHAR(191) NULL,
    `dominio_criterio` VARCHAR(191) NULL,
    `observacao_geral` VARCHAR(191) NULL,
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `ocp_cliente_id_idx`(`cliente_id`),
    INDEX `ocp_nome_programa_idx`(`nome_programa`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `terapeuta_cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `terapeuta_id` CHAR(36) NOT NULL,
    `cliente_id` CHAR(36) NOT NULL,

    UNIQUE INDEX `terapeuta_cliente_terapeuta_id_cliente_id_key`(`terapeuta_id`, `cliente_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessao_trial` ADD CONSTRAINT `sessao_trial_sessao_id_fkey` FOREIGN KEY (`sessao_id`) REFERENCES `sessao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessao_trial` ADD CONSTRAINT `sessao_trial_estimulos_ocp_id_fkey` FOREIGN KEY (`estimulos_ocp_id`) REFERENCES `estimulo_ocp`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessao` ADD CONSTRAINT `sessao_ocp_id_fkey` FOREIGN KEY (`ocp_id`) REFERENCES `ocp`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessao` ADD CONSTRAINT `sessao_terapeuta_id_fkey` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessao` ADD CONSTRAINT `sessao_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estimulo_ocp` ADD CONSTRAINT `estimulo_ocp_id_estimulo_fkey` FOREIGN KEY (`id_estimulo`) REFERENCES `estimulo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estimulo_ocp` ADD CONSTRAINT `estimulo_ocp_id_ocp_fkey` FOREIGN KEY (`id_ocp`) REFERENCES `ocp`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ocp` ADD CONSTRAINT `ocp_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ocp` ADD CONSTRAINT `ocp_criador_id_fkey` FOREIGN KEY (`criador_id`) REFERENCES `terapeuta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `terapeuta_cliente` ADD CONSTRAINT `terapeuta_cliente_terapeuta_id_fkey` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `terapeuta_cliente` ADD CONSTRAINT `terapeuta_cliente_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
