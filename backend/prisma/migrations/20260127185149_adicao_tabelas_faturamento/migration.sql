-- CreateTable
CREATE TABLE `faturamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inicio_em` DATETIME(3) NOT NULL,
    `fim_em` DATETIME(3) NOT NULL,
    `tipo_atendimento` ENUM('consultorio', 'homecare') NOT NULL,
    `ajuda_custo` BOOLEAN NULL,
    `observacao_faturamento` TEXT NULL,
    `sessao_id` INTEGER NULL,
    `evolucao_id` INTEGER NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `faturamento_inicio_em_idx`(`inicio_em`),
    INDEX `faturamento_tipo_atendimento_idx`(`tipo_atendimento`),
    UNIQUE INDEX `faturamento_sessao_id_key`(`sessao_id`),
    UNIQUE INDEX `faturamento_evolucao_id_key`(`evolucao_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faturamento_arquivo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `faturamento_id` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `caminho` VARCHAR(191) NOT NULL,
    `tamanho` INTEGER NOT NULL,
    `mime_type` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `faturamento_arquivo_faturamento_id_idx`(`faturamento_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `faturamento` ADD CONSTRAINT `faturamento_sessao_id_fkey` FOREIGN KEY (`sessao_id`) REFERENCES `sessao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faturamento` ADD CONSTRAINT `faturamento_evolucao_id_fkey` FOREIGN KEY (`evolucao_id`) REFERENCES `prontuario_evolucao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faturamento_arquivo` ADD CONSTRAINT `faturamento_arquivo_faturamento_id_fkey` FOREIGN KEY (`faturamento_id`) REFERENCES `faturamento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
