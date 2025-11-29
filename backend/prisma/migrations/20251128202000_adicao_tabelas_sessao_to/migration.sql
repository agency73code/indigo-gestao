-- CreateTable
CREATE TABLE `sessao_to` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ocp_id` INTEGER NOT NULL,
    `cliente_id` VARCHAR(191) NOT NULL,
    `terapeuta_id` VARCHAR(191) NOT NULL,
    `observacoes` TEXT NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `sessao_to_ocp_id_idx`(`ocp_id`),
    INDEX `sessao_to_cliente_id_idx`(`cliente_id`),
    INDEX `sessao_to_terapeuta_id_idx`(`terapeuta_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessao_to_trial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessao_to_id` INTEGER NOT NULL,
    `estimulos_ocp_id` INTEGER NOT NULL,
    `ordem` INTEGER NOT NULL,
    `resultado` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL,
    `duracao_minutos` INTEGER NULL,

    INDEX `sessao_to_trial_sessao_to_id_idx`(`sessao_to_id`),
    INDEX `sessao_to_trial_estimulos_ocp_id_idx`(`estimulos_ocp_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessao_to_arquivo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessao_to_id` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `caminho` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sessao_to_arquivo_sessao_to_id_idx`(`sessao_to_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessao_to` ADD CONSTRAINT `sessao_to_ocp_id_fkey` FOREIGN KEY (`ocp_id`) REFERENCES `ocp`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessao_to` ADD CONSTRAINT `sessao_to_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessao_to` ADD CONSTRAINT `sessao_to_terapeuta_id_fkey` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessao_to_trial` ADD CONSTRAINT `sessao_to_trial_sessao_to_id_fkey` FOREIGN KEY (`sessao_to_id`) REFERENCES `sessao_to`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessao_to_trial` ADD CONSTRAINT `sessao_to_trial_estimulos_ocp_id_fkey` FOREIGN KEY (`estimulos_ocp_id`) REFERENCES `estimulo_ocp`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessao_to_arquivo` ADD CONSTRAINT `sessao_to_arquivo_sessao_to_id_fkey` FOREIGN KEY (`sessao_to_id`) REFERENCES `sessao_to`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
