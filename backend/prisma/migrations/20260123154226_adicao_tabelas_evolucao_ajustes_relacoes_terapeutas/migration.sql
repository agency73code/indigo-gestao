-- DropForeignKey
ALTER TABLE `ocp_prontuario` DROP FOREIGN KEY `ocp_prontuario_terapeuta_id_fkey`;

-- DropForeignKey
ALTER TABLE `terapeuta_cliente` DROP FOREIGN KEY `terapeuta_cliente_terapeuta_id_fkey`;

-- DropForeignKey
ALTER TABLE `vinculo_supervisao` DROP FOREIGN KEY `vinculo_supervisao_clinico_id_fkey`;

-- DropForeignKey
ALTER TABLE `vinculo_supervisao` DROP FOREIGN KEY `vinculo_supervisao_supervisor_id_fkey`;

-- CreateTable
CREATE TABLE `prontuario_evolucao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prontuario_id` INTEGER NOT NULL,
    `data_evolucao` DATETIME(3) NOT NULL,
    `descricao_sessao` TEXT NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `prontuario_evolucao_prontuario_id_idx`(`prontuario_id`),
    INDEX `prontuario_evolucao_prontuario_id_data_evolucao_idx`(`prontuario_id`, `data_evolucao`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prontuario_evolucao_anexo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `evolucao_id` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `caminho` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `tamanho` INTEGER NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `prontuario_evolucao_anexo_evolucao_id_idx`(`evolucao_id`),
    INDEX `prontuario_evolucao_anexo_caminho_idx`(`caminho`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `terapeuta_cliente` ADD CONSTRAINT `terapeuta_cliente_terapeuta_id_fkey` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vinculo_supervisao` ADD CONSTRAINT `vinculo_supervisao_clinico_id_fkey` FOREIGN KEY (`clinico_id`) REFERENCES `terapeuta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vinculo_supervisao` ADD CONSTRAINT `vinculo_supervisao_supervisor_id_fkey` FOREIGN KEY (`supervisor_id`) REFERENCES `terapeuta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ocp_prontuario` ADD CONSTRAINT `ocp_prontuario_terapeuta_id_fkey` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prontuario_evolucao` ADD CONSTRAINT `prontuario_evolucao_prontuario_id_fkey` FOREIGN KEY (`prontuario_id`) REFERENCES `ocp_prontuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prontuario_evolucao_anexo` ADD CONSTRAINT `prontuario_evolucao_anexo_evolucao_id_fkey` FOREIGN KEY (`evolucao_id`) REFERENCES `prontuario_evolucao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
