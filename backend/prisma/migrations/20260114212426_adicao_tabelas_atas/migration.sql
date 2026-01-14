-- CreateTable
CREATE TABLE `ata_reuniao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `terapeuta_id` VARCHAR(191) NOT NULL,
    `cliente_id` VARCHAR(191) NULL,
    `data` DATE NOT NULL,
    `horario_inicio` VARCHAR(191) NOT NULL,
    `horario_fim` VARCHAR(191) NOT NULL,
    `finalidade` ENUM('orientacao_parental', 'reuniao_equipe', 'reuniao_outro_especialista', 'reuniao_escola', 'supervisao_at', 'supervisao_terapeuta', 'outros') NOT NULL,
    `finalidade_outros` VARCHAR(191) NULL,
    `modalidade` ENUM('online', 'presencial') NOT NULL,
    `conteudo` TEXT NOT NULL,
    `status` ENUM('rascunho', 'finalizada') NOT NULL DEFAULT 'rascunho',
    `cabecalho_terapeuta_id` VARCHAR(191) NOT NULL,
    `cabecalho_terapeuta_nome` VARCHAR(191) NOT NULL,
    `cabecalho_conselho_numero` VARCHAR(191) NULL,
    `cabecalho_area_atuacao` VARCHAR(191) NULL,
    `cabecalho_cargo` VARCHAR(191) NULL,
    `duracao_minutos` INTEGER NULL,
    `horas_faturadas` DECIMAL(10, 2) NULL,
    `resumo_ia` TEXT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `ata_reuniao_terapeuta_id_idx`(`terapeuta_id`),
    INDEX `ata_reuniao_cliente_id_idx`(`cliente_id`),
    INDEX `ata_reuniao_data_idx`(`data`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ata_participante` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ata_reuniao_id` INTEGER NOT NULL,
    `tipo` ENUM('familia', 'profissional_externo', 'profissional_clinica') NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `terapeuta_id` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ata_participante_ata_reuniao_id_idx`(`ata_reuniao_id`),
    INDEX `ata_participante_terapeuta_id_idx`(`terapeuta_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ata_link_recomendacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ata_reuniao_id` INTEGER NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ata_link_recomendacao_ata_reuniao_id_idx`(`ata_reuniao_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ata_anexo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ata_reuniao_id` INTEGER NOT NULL,
    `external_id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NULL,
    `original_nome` VARCHAR(191) NULL,
    `mime_type` VARCHAR(191) NULL,
    `tamanho` INTEGER NULL,
    `caminho` TEXT NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ata_anexo_ata_reuniao_id_idx`(`ata_reuniao_id`),
    UNIQUE INDEX `ata_anexo_ata_reuniao_id_external_id_key`(`ata_reuniao_id`, `external_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ata_participante` ADD CONSTRAINT `ata_participante_ata_reuniao_id_fkey` FOREIGN KEY (`ata_reuniao_id`) REFERENCES `ata_reuniao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ata_link_recomendacao` ADD CONSTRAINT `ata_link_recomendacao_ata_reuniao_id_fkey` FOREIGN KEY (`ata_reuniao_id`) REFERENCES `ata_reuniao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ata_anexo` ADD CONSTRAINT `ata_anexo_ata_reuniao_id_fkey` FOREIGN KEY (`ata_reuniao_id`) REFERENCES `ata_reuniao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
