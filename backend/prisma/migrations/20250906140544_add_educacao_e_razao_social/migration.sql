-- CreateTable
CREATE TABLE `area_atuacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cargo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cliente` (
    `id` CHAR(36) NOT NULL,
    `nome` VARCHAR(150) NOT NULL,
    `data_nascimento` DATE NOT NULL,
    `email_contato` VARCHAR(255) NOT NULL,
    `data_entrada` DATE NOT NULL,
    `data_saida` DATE NULL,
    `status` ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
    `perfil_acesso` VARCHAR(20) NOT NULL,
    `senha` VARCHAR(255) NULL,
    `token_redefinicao` CHAR(36) NULL,
    `validade_token` DATETIME(0) NULL,
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email_contato_UNIQUE`(`email_contato`),
    INDEX `nome_idx`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cliente_endereco` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cliente_id` CHAR(36) NOT NULL,
    `endereco_id` INTEGER NOT NULL,
    `tipo_endereco_id` INTEGER NOT NULL,
    `principal` TINYINT NOT NULL DEFAULT 0,
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `cliente_principal_idx`(`cliente_id`, `principal`),
    INDEX `fk_cliente_endereco_tipo_endereco1_idx`(`tipo_endereco_id`),
    INDEX `fk_cliente_has_endereco_cliente1_idx`(`cliente_id`),
    INDEX `fk_cliente_has_endereco_endereco1_idx`(`endereco_id`),
    UNIQUE INDEX `uk_cli_end_tipo`(`cliente_id`, `endereco_id`, `tipo_endereco_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cliente_escola` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cliente_id` CHAR(36) NOT NULL,
    `escola_id` INTEGER NOT NULL,

    INDEX `fk_cliente_has_escolas_cliente1_idx`(`cliente_id`),
    INDEX `fk_cliente_has_escolas_escola1_idx`(`escola_id`),
    UNIQUE INDEX `cliente_escola`(`cliente_id`, `escola_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cliente_responsavel` (
    `cliente_id` CHAR(36) NOT NULL,
    `responsaveis_id` INTEGER NOT NULL,
    `parentesco` ENUM('mae', 'pai', 'responsavel_legal', 'outro') NOT NULL,
    `prioridade` TINYINT NOT NULL DEFAULT 1,

    INDEX `fk_cliente_has_responsaveis_cliente1_idx`(`cliente_id`),
    INDEX `fk_cliente_has_responsaveis_responsaveis1_idx`(`responsaveis_id`),
    INDEX `parentesco_idx`(`parentesco`),
    PRIMARY KEY (`cliente_id`, `responsaveis_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documentos_terapeuta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `terapeuta_id` CHAR(36) NOT NULL,
    `tipo_documento` VARCHAR(50) NOT NULL,
    `caminho_arquivo` VARCHAR(255) NOT NULL,
    `data_upload` DATE NOT NULL,

    INDEX `fk_documentos_terapeuta_terapeuta1_idx`(`terapeuta_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `endereco` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cep` CHAR(8) NOT NULL,
    `logradouro` VARCHAR(255) NOT NULL,
    `numero` VARCHAR(10) NOT NULL,
    `bairro` VARCHAR(100) NOT NULL,
    `cidade` VARCHAR(100) NOT NULL,
    `uf` CHAR(2) NOT NULL,
    `complemento` VARCHAR(100) NULL,
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `cep_idx`(`cep`),
    INDEX `cidade_uf_idx`(`cidade`, `uf`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `escola` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo_escola` ENUM('particular', 'publica') NOT NULL,
    `nome` VARCHAR(150) NOT NULL,
    `telefone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `escola_endereco` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `escola_id` INTEGER NOT NULL,
    `endereco_id` INTEGER NOT NULL,
    `tipo_endereco_id` INTEGER NOT NULL,
    `principal` TINYINT NOT NULL DEFAULT 0,
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `escola_principal_idx`(`escola_id`, `principal`),
    INDEX `fk_escola_endereco_tipo_endereco1_idx`(`tipo_endereco_id`),
    INDEX `fk_escola_has_endereco_endereco1_idx`(`endereco_id`),
    INDEX `fk_escola_has_endereco_escola1_idx`(`escola_id`),
    UNIQUE INDEX `uk_esc_end_tipo`(`escola_id`, `endereco_id`, `tipo_endereco_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagamento_contatos` (
    `contato_id` INTEGER NOT NULL AUTO_INCREMENT,
    `pagamentos_id` INTEGER NOT NULL,
    `categoria` ENUM('geral', 'advogado', 'outro') NOT NULL DEFAULT 'geral',
    `tipo` ENUM('telefone', 'email') NOT NULL,
    `valor` VARCHAR(45) NOT NULL,

    INDEX `fk_pagamento_contatos_pagamentos1_idx`(`pagamentos_id`),
    PRIMARY KEY (`contato_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cliente_id` CHAR(36) NOT NULL,
    `nome` VARCHAR(150) NULL,
    `numero_carteirinha` VARCHAR(50) NULL,
    `tipo_sistema` ENUM('reembolso', 'liminar', 'particular') NOT NULL,
    `prazo_reembolso_dias` INTEGER NULL,
    `numero_processo` VARCHAR(50) NULL,
    `nome_advogado` VARCHAR(150) NULL,
    `valor_sessao` DECIMAL(10, 2) NULL,
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_pagamentos_cliente1_idx`(`cliente_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `responsaveis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `cpf` CHAR(11) NOT NULL,
    `telefone` VARCHAR(20) NULL,
    `email` VARCHAR(255) NULL,
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `cpf_UNIQUE`(`cpf`),
    INDEX `nome_idx`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `terapeuta` (
    `id` CHAR(36) NOT NULL,
    `nome` VARCHAR(255) NOT NULL,
    `cpf` CHAR(11) NOT NULL,
    `data_nascimento` DATE NOT NULL,
    `telefone` VARCHAR(20) NULL,
    `celular` VARCHAR(20) NOT NULL,
    `foto_perfil` VARCHAR(255) NULL,
    `email` VARCHAR(255) NOT NULL,
    `email_indigo` VARCHAR(255) NOT NULL,
    `possui_veiculo` ENUM('sim', 'nao') NOT NULL,
    `placa_veiculo` VARCHAR(20) NULL,
    `modelo_veiculo` VARCHAR(50) NULL,
    `banco` VARCHAR(50) NOT NULL,
    `agencia` VARCHAR(20) NOT NULL,
    `conta` VARCHAR(50) NOT NULL,
    `chave_pix` VARCHAR(255) NULL,
    `cnpj_empresa` VARCHAR(14) NULL,
    `razao_social` VARCHAR(191) NULL,
    `graduacao` VARCHAR(191) NULL,
    `grad_instituicao` VARCHAR(191) NULL,
    `ano_formatura` VARCHAR(4) NULL,
    `pos_graduacao` VARCHAR(191) NULL,
    `pos_grad_instituicao` VARCHAR(191) NULL,
    `ano_pos_graduacao` VARCHAR(4) NULL,
    `cursos` TEXT NULL,
    `data_entrada` DATE NOT NULL,
    `data_saida` DATE NULL,
    `perfil_acesso` VARCHAR(20) NOT NULL,
    `atividade` ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
    `senha` VARCHAR(255) NULL,
    `token_redefinicao` CHAR(36) NULL,
    `validade_token` DATETIME(0) NULL,
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `cpf_UNIQUE`(`cpf`),
    UNIQUE INDEX `email_UNIQUE`(`email`),
    UNIQUE INDEX `email_indigo_UNIQUE`(`email_indigo`),
    UNIQUE INDEX `cnpj_empresa_UNIQUE`(`cnpj_empresa`),
    INDEX `atividade_idx`(`atividade`),
    INDEX `nome_idx`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `terapeuta_area_atuacao` (
    `terapeuta_id` CHAR(36) NOT NULL,
    `area_atuacao_id` INTEGER NOT NULL,

    INDEX `fk_terapeuta_has_area_atuacao_area_atuacao1_idx`(`area_atuacao_id`),
    INDEX `fk_terapeuta_has_area_atuacao_terapeuta_idx`(`terapeuta_id`),
    PRIMARY KEY (`terapeuta_id`, `area_atuacao_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `terapeuta_cargo` (
    `terapeuta_id` CHAR(36) NOT NULL,
    `cargo_id` INTEGER NOT NULL,
    `numero_conselho` VARCHAR(50) NULL,
    `data_entrada` DATE NOT NULL,
    `data_saida` DATE NULL,

    INDEX `fk_terapeuta_has_cargo_cargo1_idx`(`cargo_id`),
    INDEX `fk_terapeuta_has_cargo_terapeuta1_idx`(`terapeuta_id`),
    PRIMARY KEY (`terapeuta_id`, `cargo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `terapeuta_endereco` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `terapeuta_id` CHAR(36) NOT NULL,
    `endereco_id` INTEGER NOT NULL,
    `tipo_endereco_id` INTEGER NOT NULL,
    `principal` TINYINT NOT NULL DEFAULT 0,
    `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_terapeuta_endereco_tipo_endereco1_idx`(`tipo_endereco_id`),
    INDEX `fk_terapeuta_has_endereco_endereco1_idx`(`endereco_id`),
    INDEX `fk_terapeuta_has_endereco_terapeuta1_idx`(`terapeuta_id`),
    INDEX `terapeuta_principal_idx`(`terapeuta_id`, `principal`),
    UNIQUE INDEX `uk_ter_end_tipo`(`terapeuta_id`, `endereco_id`, `tipo_endereco_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_endereco` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` VARCHAR(30) NOT NULL,

    UNIQUE INDEX `tipo_UNIQUE`(`tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cliente_endereco` ADD CONSTRAINT `fk_cliente_endereco_tipo_endereco1` FOREIGN KEY (`tipo_endereco_id`) REFERENCES `tipo_endereco`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cliente_endereco` ADD CONSTRAINT `fk_cliente_has_endereco_cliente1` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cliente_endereco` ADD CONSTRAINT `fk_cliente_has_endereco_endereco1` FOREIGN KEY (`endereco_id`) REFERENCES `endereco`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cliente_escola` ADD CONSTRAINT `fk_cliente_has_escola_cliente1` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cliente_escola` ADD CONSTRAINT `fk_cliente_has_escola_escola1` FOREIGN KEY (`escola_id`) REFERENCES `escola`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cliente_responsavel` ADD CONSTRAINT `fk_cliente_has_responsaveis_cliente1` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cliente_responsavel` ADD CONSTRAINT `fk_cliente_has_responsaveis_responsaveis1` FOREIGN KEY (`responsaveis_id`) REFERENCES `responsaveis`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `documentos_terapeuta` ADD CONSTRAINT `fk_documentos_terapeuta_terapeuta1` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `escola_endereco` ADD CONSTRAINT `fk_escola_endereco_tipo_endereco1` FOREIGN KEY (`tipo_endereco_id`) REFERENCES `tipo_endereco`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `escola_endereco` ADD CONSTRAINT `fk_escola_has_endereco_endereco1` FOREIGN KEY (`endereco_id`) REFERENCES `endereco`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `escola_endereco` ADD CONSTRAINT `fk_escola_has_endereco_escola1` FOREIGN KEY (`escola_id`) REFERENCES `escola`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pagamento_contatos` ADD CONSTRAINT `fk_pagamento_contatos_pagamentos1` FOREIGN KEY (`pagamentos_id`) REFERENCES `pagamentos`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `fk_pagamentos_cliente1` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `terapeuta_area_atuacao` ADD CONSTRAINT `fk_terapeuta_has_area_atuacao_area_atuacao1` FOREIGN KEY (`area_atuacao_id`) REFERENCES `area_atuacao`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `terapeuta_area_atuacao` ADD CONSTRAINT `fk_terapeuta_has_area_atuacao_terapeuta` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `terapeuta_cargo` ADD CONSTRAINT `fk_terapeuta_has_cargo_cargo1` FOREIGN KEY (`cargo_id`) REFERENCES `cargo`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `terapeuta_cargo` ADD CONSTRAINT `fk_terapeuta_has_cargo_terapeuta1` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `terapeuta_endereco` ADD CONSTRAINT `fk_terapeuta_endereco_tipo_endereco1` FOREIGN KEY (`tipo_endereco_id`) REFERENCES `tipo_endereco`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `terapeuta_endereco` ADD CONSTRAINT `fk_terapeuta_has_endereco_endereco1` FOREIGN KEY (`endereco_id`) REFERENCES `endereco`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `terapeuta_endereco` ADD CONSTRAINT `fk_terapeuta_has_endereco_terapeuta1` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
