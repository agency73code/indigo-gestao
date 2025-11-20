-- CreateTable
CREATE TABLE `relatorio` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'final',
    `periodo_inicio` DATETIME(3) NOT NULL,
    `periodo_fim` DATETIME(3) NOT NULL,
    `observacoes_clinicas` LONGTEXT NULL,
    `filtros` JSON NULL,
    `dados_gerados` JSON NULL,
    `pdf_arquivo_id` VARCHAR(191) NULL,
    `pdf_nome` VARCHAR(191) NULL,
    `pdf_mime` VARCHAR(191) NULL,
    `pdf_tamanho` INTEGER NULL,
    `pdf_url` VARCHAR(191) NULL,
    `pasta_relatorios_drive` VARCHAR(191) NULL,
    `clienteId` VARCHAR(191) NOT NULL,
    `terapeutaId` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `relatorio_clienteId_idx`(`clienteId`),
    INDEX `relatorio_terapeutaId_idx`(`terapeutaId`),
    INDEX `relatorio_periodo_idx`(`periodo_inicio`, `periodo_fim`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `relatorio` ADD CONSTRAINT `relatorio_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `relatorio` ADD CONSTRAINT `relatorio_terapeutaId_fkey` FOREIGN KEY (`terapeutaId`) REFERENCES `terapeuta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
