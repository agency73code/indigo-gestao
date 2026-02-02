-- CreateTable
CREATE TABLE `cliente_valor_area` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cliente_id` VARCHAR(191) NOT NULL,
    `area_atuacao_id` INTEGER NOT NULL,
    `valor_sessao` DECIMAL(10, 2) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `cliente_valor_area_criado_em_idx`(`criado_em`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cliente_valor_area` ADD CONSTRAINT `cliente_valor_area_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente_valor_area` ADD CONSTRAINT `cliente_valor_area_area_atuacao_id_fkey` FOREIGN KEY (`area_atuacao_id`) REFERENCES `area_atuacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
