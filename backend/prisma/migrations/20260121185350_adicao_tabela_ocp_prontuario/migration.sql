-- AlterTable
ALTER TABLE `cliente` ADD COLUMN `nivel_escolaridade` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ocp_prontuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cliente_id` VARCHAR(191) NOT NULL,
    `terapeuta_id` VARCHAR(191) NOT NULL,
    `profissao_ocupacao` VARCHAR(191) NULL,
    `observacao_educacional` TEXT NULL,
    `observacoes_nucleo_familiar` TEXT NULL,
    `encaminhado_por` VARCHAR(191) NULL,
    `motivo_busca_atendimento` VARCHAR(191) NOT NULL,
    `atendimentos_anteriores` VARCHAR(191) NULL,
    `observacao_demanda` TEXT NULL,
    `objetivos_trabalho` VARCHAR(191) NOT NULL,
    `avaliacao_atendimento` VARCHAR(191) NULL,

    INDEX `ocp_prontuario_cliente_id_idx`(`cliente_id`),
    INDEX `ocp_prontuario_terapeuta_id_idx`(`terapeuta_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ocp_prontuario` ADD CONSTRAINT `ocp_prontuario_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ocp_prontuario` ADD CONSTRAINT `ocp_prontuario_terapeuta_id_fkey` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
