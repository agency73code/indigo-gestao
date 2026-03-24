-- AlterTable
ALTER TABLE `terapeuta_cliente` ALTER COLUMN `valor_sessao_consultorio` DROP DEFAULT,
    ALTER COLUMN `valor_sessao_homecare` DROP DEFAULT,
    ALTER COLUMN `valor_hora_desenvolvimento_materiais` DROP DEFAULT,
    ALTER COLUMN `valor_hora_supervisao_recebida` DROP DEFAULT,
    ALTER COLUMN `valor_hora_supervisao_dada` DROP DEFAULT,
    ALTER COLUMN `valor_hora_reuniao` DROP DEFAULT;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `registroId` VARCHAR(191) NOT NULL,
    `acao` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
