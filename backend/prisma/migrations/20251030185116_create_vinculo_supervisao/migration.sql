-- CreateTable
CREATE TABLE `vinculo_supervisao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supervisor_id` VARCHAR(191) NOT NULL,
    `clinico_id` VARCHAR(191) NOT NULL,
    `nivel_hierarquia` INTEGER NULL DEFAULT 1,
    `escopo_supervisao` VARCHAR(191) NULL DEFAULT 'direto',
    `data_inicio` DATETIME(3) NOT NULL,
    `data_fim` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ativo',
    `observacoes` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `vinculo_supervisao_clinico_id_idx`(`clinico_id`),
    UNIQUE INDEX `vinculo_supervisao_supervisor_id_clinico_id_key`(`supervisor_id`, `clinico_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `formacao_terapeuta_id_fkey` ON `formacao`(`terapeuta_id`);

-- AddForeignKey
ALTER TABLE `vinculo_supervisao` ADD CONSTRAINT `vinculo_supervisao_supervisor_id_fkey` FOREIGN KEY (`supervisor_id`) REFERENCES `terapeuta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vinculo_supervisao` ADD CONSTRAINT `vinculo_supervisao_clinico_id_fkey` FOREIGN KEY (`clinico_id`) REFERENCES `terapeuta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
