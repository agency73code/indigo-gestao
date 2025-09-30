/*
  Warnings:

  - The primary key for the `cliente` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `data_entrada` on the `cliente` table. All the data in the column will be lost.
  - You are about to drop the column `data_nascimento` on the `cliente` table. All the data in the column will be lost.
  - You are about to drop the column `data_saida` on the `cliente` table. All the data in the column will be lost.
  - You are about to drop the column `email_contato` on the `cliente` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `cliente` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(5))` to `VarChar(191)`.
  - You are about to alter the column `senha` on the `cliente` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to drop the column `atualizado_em` on the `cliente_endereco` table. All the data in the column will be lost.
  - You are about to drop the column `cliente_id` on the `cliente_endereco` table. All the data in the column will be lost.
  - You are about to drop the column `criado_em` on the `cliente_endereco` table. All the data in the column will be lost.
  - You are about to drop the column `endereco_id` on the `cliente_endereco` table. All the data in the column will be lost.
  - You are about to drop the column `principal` on the `cliente_endereco` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_endereco_id` on the `cliente_endereco` table. All the data in the column will be lost.
  - You are about to drop the `cliente_escola` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cliente_responsavel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `documentos_terapeuta` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `escola` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `escola_endereco` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pagamento_contatos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pagamentos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `responsaveis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tipo_endereco` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[emailContato]` on the table `cliente` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clienteId` to the `cliente_endereco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enderecoId` to the `cliente_endereco` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `cliente_endereco` DROP FOREIGN KEY `fk_cliente_endereco_tipo_endereco1`;

-- DropForeignKey
ALTER TABLE `cliente_endereco` DROP FOREIGN KEY `fk_cliente_has_endereco_cliente1`;

-- DropForeignKey
ALTER TABLE `cliente_endereco` DROP FOREIGN KEY `fk_cliente_has_endereco_endereco1`;

-- DropForeignKey
ALTER TABLE `cliente_escola` DROP FOREIGN KEY `fk_cliente_has_escola_cliente1`;

-- DropForeignKey
ALTER TABLE `cliente_escola` DROP FOREIGN KEY `fk_cliente_has_escola_escola1`;

-- DropForeignKey
ALTER TABLE `cliente_responsavel` DROP FOREIGN KEY `fk_cliente_has_responsaveis_cliente1`;

-- DropForeignKey
ALTER TABLE `cliente_responsavel` DROP FOREIGN KEY `fk_cliente_has_responsaveis_responsaveis1`;

-- DropForeignKey
ALTER TABLE `documentos_terapeuta` DROP FOREIGN KEY `fk_documentos_terapeuta_terapeuta1`;

-- DropForeignKey
ALTER TABLE `escola_endereco` DROP FOREIGN KEY `fk_escola_endereco_tipo_endereco1`;

-- DropForeignKey
ALTER TABLE `escola_endereco` DROP FOREIGN KEY `fk_escola_has_endereco_endereco1`;

-- DropForeignKey
ALTER TABLE `escola_endereco` DROP FOREIGN KEY `fk_escola_has_endereco_escola1`;

-- DropForeignKey
ALTER TABLE `ocp` DROP FOREIGN KEY `ocp_cliente_id_fkey`;

-- DropForeignKey
ALTER TABLE `ocp` DROP FOREIGN KEY `ocp_criador_id_fkey`;

-- DropForeignKey
ALTER TABLE `pagamento_contatos` DROP FOREIGN KEY `fk_pagamento_contatos_pagamentos1`;

-- DropForeignKey
ALTER TABLE `pagamentos` DROP FOREIGN KEY `fk_pagamentos_cliente1`;

-- DropForeignKey
ALTER TABLE `sessao` DROP FOREIGN KEY `sessao_cliente_id_fkey`;

-- DropForeignKey
ALTER TABLE `sessao` DROP FOREIGN KEY `sessao_terapeuta_id_fkey`;

-- DropForeignKey
ALTER TABLE `terapeuta_cliente` DROP FOREIGN KEY `terapeuta_cliente_cliente_id_fkey`;

-- DropForeignKey
ALTER TABLE `terapeuta_cliente` DROP FOREIGN KEY `terapeuta_cliente_terapeuta_id_fkey`;

-- DropIndex
DROP INDEX `cliente_id_key` ON `cliente`;

-- DropIndex
DROP INDEX `email_contato_UNIQUE` ON `cliente`;

-- DropIndex
DROP INDEX `cliente_principal_idx` ON `cliente_endereco`;

-- DropIndex
DROP INDEX `fk_cliente_endereco_tipo_endereco1_idx` ON `cliente_endereco`;

-- DropIndex
DROP INDEX `fk_cliente_has_endereco_cliente1_idx` ON `cliente_endereco`;

-- DropIndex
DROP INDEX `fk_cliente_has_endereco_endereco1_idx` ON `cliente_endereco`;

-- DropIndex
DROP INDEX `uk_cli_end_tipo` ON `cliente_endereco`;

-- DropIndex
DROP INDEX `ocp_criador_id_fkey` ON `ocp`;

-- DropIndex
DROP INDEX `sessao_cliente_id_fkey` ON `sessao`;

-- DropIndex
DROP INDEX `terapeuta_cliente_cliente_id_fkey` ON `terapeuta_cliente`;

-- AlterTable
ALTER TABLE `cliente` DROP PRIMARY KEY,
    DROP COLUMN `data_entrada`,
    DROP COLUMN `data_nascimento`,
    DROP COLUMN `data_saida`,
    DROP COLUMN `email_contato`,
    ADD COLUMN `cpf` VARCHAR(191) NULL,
    ADD COLUMN `dataEntrada` DATETIME(3) NULL,
    ADD COLUMN `dataNascimento` DATETIME(3) NULL,
    ADD COLUMN `dataSaida` DATETIME(3) NULL,
    ADD COLUMN `emailContato` VARCHAR(191) NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `nome` VARCHAR(191) NULL,
    MODIFY `status` VARCHAR(191) NULL,
    MODIFY `perfil_acesso` VARCHAR(191) NULL,
    MODIFY `senha` VARCHAR(191) NULL,
    MODIFY `token_redefinicao` VARCHAR(191) NULL,
    MODIFY `validade_token` DATETIME(3) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `cliente_endereco` DROP COLUMN `atualizado_em`,
    DROP COLUMN `cliente_id`,
    DROP COLUMN `criado_em`,
    DROP COLUMN `endereco_id`,
    DROP COLUMN `principal`,
    DROP COLUMN `tipo_endereco_id`,
    ADD COLUMN `clienteId` VARCHAR(191) NOT NULL,
    ADD COLUMN `enderecoId` INTEGER NOT NULL,
    ADD COLUMN `outroResidencia` VARCHAR(191) NULL,
    ADD COLUMN `residenciaDe` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `disciplina` MODIFY `nome` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `endereco` MODIFY `cep` CHAR(8) NULL,
    MODIFY `rua` VARCHAR(255) NULL,
    MODIFY `numero` VARCHAR(10) NULL,
    MODIFY `bairro` VARCHAR(100) NULL,
    MODIFY `cidade` VARCHAR(100) NULL,
    MODIFY `uf` CHAR(2) NULL;

-- AlterTable
ALTER TABLE `ocp` MODIFY `cliente_id` VARCHAR(191) NOT NULL,
    MODIFY `criador_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `sessao` MODIFY `cliente_id` VARCHAR(191) NOT NULL,
    MODIFY `terapeuta_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `terapeuta_cliente` MODIFY `terapeuta_id` VARCHAR(191) NOT NULL,
    MODIFY `cliente_id` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `cliente_escola`;

-- DropTable
DROP TABLE `cliente_responsavel`;

-- DropTable
DROP TABLE `documentos_terapeuta`;

-- DropTable
DROP TABLE `escola`;

-- DropTable
DROP TABLE `escola_endereco`;

-- DropTable
DROP TABLE `pagamento_contatos`;

-- DropTable
DROP TABLE `pagamentos`;

-- DropTable
DROP TABLE `responsaveis`;

-- DropTable
DROP TABLE `tipo_endereco`;

-- CreateTable
CREATE TABLE `cuidador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `relacao` VARCHAR(191) NULL,
    `descricaoRelacao` VARCHAR(191) NULL,
    `nome` VARCHAR(191) NULL,
    `cpf` CHAR(11) NULL,
    `profissao` VARCHAR(191) NULL,
    `escolaridade` VARCHAR(191) NULL,
    `telefone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `clienteId` VARCHAR(191) NOT NULL,
    `enderecoId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dados_pagamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` VARCHAR(191) NOT NULL,
    `nomeTitular` VARCHAR(191) NULL,
    `numeroCarteirinha` VARCHAR(191) NULL,
    `telefone1` VARCHAR(191) NULL,
    `telefone2` VARCHAR(191) NULL,
    `telefone3` VARCHAR(191) NULL,
    `email1` VARCHAR(191) NULL,
    `email2` VARCHAR(191) NULL,
    `email3` VARCHAR(191) NULL,
    `sistemaPagamento` VARCHAR(191) NOT NULL,
    `prazoReembolso` VARCHAR(191) NULL,
    `numeroProcesso` VARCHAR(191) NULL,
    `nomeAdvogado` VARCHAR(191) NULL,
    `telefoneAdvogado1` VARCHAR(191) NULL,
    `telefoneAdvogado2` VARCHAR(191) NULL,
    `telefoneAdvogado3` VARCHAR(191) NULL,
    `emailAdvogado1` VARCHAR(191) NULL,
    `emailAdvogado2` VARCHAR(191) NULL,
    `emailAdvogado3` VARCHAR(191) NULL,
    `houveNegociacao` VARCHAR(191) NULL,
    `valorAcordado` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `dados_pagamento_clienteId_key`(`clienteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dados_escola` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` VARCHAR(191) NOT NULL,
    `tipoEscola` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NULL,
    `telefone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `enderecoId` INTEGER NULL,

    UNIQUE INDEX `dados_escola_clienteId_key`(`clienteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `escola_contato` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dadosEscolaId` INTEGER NOT NULL,
    `nome` VARCHAR(191) NULL,
    `telefone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `funcao` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `arquivos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` VARCHAR(191) NULL,
    `terapeutaId` VARCHAR(191) NULL,
    `tipo` VARCHAR(191) NULL,
    `arquivo_id` VARCHAR(191) NULL,
    `mime_type` VARCHAR(191) NULL,
    `tamanho` INTEGER NULL,
    `data_upload` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `arquivos_tipo_idx`(`tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `cliente_emailContato_key` ON `cliente`(`emailContato`);

-- AddForeignKey
ALTER TABLE `cuidador` ADD CONSTRAINT `cuidador_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cuidador` ADD CONSTRAINT `cuidador_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `endereco`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente_endereco` ADD CONSTRAINT `cliente_endereco_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cliente_endereco` ADD CONSTRAINT `cliente_endereco_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `endereco`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dados_pagamento` ADD CONSTRAINT `dados_pagamento_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dados_escola` ADD CONSTRAINT `dados_escola_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dados_escola` ADD CONSTRAINT `dados_escola_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `endereco`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `escola_contato` ADD CONSTRAINT `escola_contato_dadosEscolaId_fkey` FOREIGN KEY (`dadosEscolaId`) REFERENCES `dados_escola`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `arquivos` ADD CONSTRAINT `arquivos_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `cliente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `arquivos` ADD CONSTRAINT `arquivos_terapeutaId_fkey` FOREIGN KEY (`terapeutaId`) REFERENCES `terapeuta`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessao` ADD CONSTRAINT `sessao_terapeuta_id_fkey` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessao` ADD CONSTRAINT `sessao_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ocp` ADD CONSTRAINT `ocp_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ocp` ADD CONSTRAINT `ocp_criador_id_fkey` FOREIGN KEY (`criador_id`) REFERENCES `terapeuta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `terapeuta_cliente` ADD CONSTRAINT `terapeuta_cliente_terapeuta_id_fkey` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `terapeuta_cliente` ADD CONSTRAINT `terapeuta_cliente_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
