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
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cliente_id_key`(`id`),
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
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

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
    `rua` VARCHAR(255) NOT NULL,
    `numero` VARCHAR(10) NOT NULL,
    `bairro` VARCHAR(100) NOT NULL,
    `cidade` VARCHAR(100) NOT NULL,
    `uf` CHAR(2) NOT NULL,
    `complemento` VARCHAR(100) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `endereco_cep_idx`(`cep`),
    INDEX `endereco_cidade_uf_idx`(`cidade`, `uf`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `escola` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo_escola` ENUM('particular', 'publica') NOT NULL,
    `nome` VARCHAR(150) NOT NULL,
    `telefone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `escola_endereco` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `escola_id` INTEGER NOT NULL,
    `endereco_id` INTEGER NOT NULL,
    `tipo_endereco_id` INTEGER NOT NULL,
    `principal` TINYINT NOT NULL DEFAULT 0,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

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
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

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
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cpf_UNIQUE`(`cpf`),
    INDEX `nome_idx`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `terapeuta` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `email_indigo` VARCHAR(191) NOT NULL,
    `celular` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `data_nascimento` DATETIME(3) NOT NULL,
    `possui_veiculo` BOOLEAN NOT NULL DEFAULT false,
    `placa_veiculo` VARCHAR(191) NULL,
    `modelo_veiculo` VARCHAR(191) NULL,
    `banco` VARCHAR(191) NULL,
    `agencia` VARCHAR(191) NULL,
    `conta` VARCHAR(191) NULL,
    `chave_pix` VARCHAR(191) NULL,
    `valor_hora` DECIMAL(10, 2) NULL,
    `professor_uni` BOOLEAN NOT NULL DEFAULT false,
    `endereco_id` INTEGER NULL,
    `data_entrada` DATETIME(3) NOT NULL,
    `data_saida` DATETIME(3) NULL,
    `perfil_acesso` VARCHAR(191) NOT NULL,
    `atividade` BOOLEAN NOT NULL DEFAULT true,
    `senha` VARCHAR(255) NULL,
    `token_redefinicao` VARCHAR(191) NULL,
    `validade_token` DATETIME(3) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `terapeuta_email_key`(`email`),
    UNIQUE INDEX `terapeuta_email_indigo_key`(`email_indigo`),
    UNIQUE INDEX `terapeuta_cpf_key`(`cpf`),
    INDEX `terapeuta_atividade_idx`(`atividade`),
    INDEX `terapeuta_nome_idx`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `formacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `graduacao` VARCHAR(191) NULL,
    `instituicao_graduacao` VARCHAR(191) NULL,
    `ano_formatura` INTEGER NULL,
    `participacao_congressos` TEXT NULL,
    `publicacoes_descricao` TEXT NULL,
    `terapeuta_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pos_graduacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` VARCHAR(191) NULL,
    `curso` VARCHAR(191) NULL,
    `instituicao` VARCHAR(191) NULL,
    `conclusao` VARCHAR(191) NULL,
    `formacao_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registro_profissional` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `area_atuacao` VARCHAR(191) NOT NULL,
    `cargo` VARCHAR(191) NULL,
    `numero_conselho` VARCHAR(191) NULL,
    `terapeuta_id` VARCHAR(191) NOT NULL,

    INDEX `registro_profissional_area_atuacao_idx`(`area_atuacao`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pessoa_juridica` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cnpj` VARCHAR(191) NOT NULL,
    `razao_social` VARCHAR(191) NULL,
    `endereco_id` INTEGER NOT NULL,
    `terapeuta_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `pessoa_juridica_cnpj_key`(`cnpj`),
    UNIQUE INDEX `pessoa_juridica_terapeuta_id_key`(`terapeuta_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `disciplina` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_endereco` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` VARCHAR(30) NOT NULL,

    UNIQUE INDEX `tipo_UNIQUE`(`tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessao_trial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessao_id` INTEGER NOT NULL,
    `estimulos_ocp_id` INTEGER NOT NULL,
    `ordem` INTEGER NOT NULL,
    `resultado` VARCHAR(191) NOT NULL,

    INDEX `sessao_trial_sessao_id_idx`(`sessao_id`),
    INDEX `sessao_trial_estimulos_ocp_id_idx`(`estimulos_ocp_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ocp_id` INTEGER NOT NULL,
    `cliente_id` CHAR(36) NOT NULL,
    `terapeuta_id` CHAR(36) NOT NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `sessao_terapeuta_id_data_criacao_idx`(`terapeuta_id`, `data_criacao`),
    INDEX `sessao_ocp_id_idx`(`ocp_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estimulo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,

    UNIQUE INDEX `estimulo_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estimulo_ocp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_estimulo` INTEGER NOT NULL,
    `id_ocp` INTEGER NOT NULL,
    `nome` VARCHAR(191) NULL,
    `descricao` VARCHAR(191) NULL,
    `status` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ocp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cliente_id` CHAR(36) NOT NULL,
    `criador_id` CHAR(36) NOT NULL,
    `nome_programa` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `objetivo_programa` VARCHAR(191) NULL,
    `objetivo_descricao` VARCHAR(191) NULL,
    `dominio_criterio` VARCHAR(191) NULL,
    `observacao_geral` VARCHAR(191) NULL,
    `atualizado_em` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',

    INDEX `ocp_cliente_id_idx`(`cliente_id`),
    INDEX `ocp_nome_programa_idx`(`nome_programa`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `terapeuta_cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `terapeuta_id` CHAR(36) NOT NULL,
    `cliente_id` CHAR(36) NOT NULL,

    UNIQUE INDEX `terapeuta_cliente_terapeuta_id_cliente_id_key`(`terapeuta_id`, `cliente_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_disciplinaToterapeuta` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_disciplinaToterapeuta_AB_unique`(`A`, `B`),
    INDEX `_disciplinaToterapeuta_B_index`(`B`)
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
ALTER TABLE `terapeuta` ADD CONSTRAINT `terapeuta_endereco_id_fkey` FOREIGN KEY (`endereco_id`) REFERENCES `endereco`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `formacao` ADD CONSTRAINT `formacao_terapeuta_id_fkey` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_graduacao` ADD CONSTRAINT `pos_graduacao_formacao_id_fkey` FOREIGN KEY (`formacao_id`) REFERENCES `formacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registro_profissional` ADD CONSTRAINT `registro_profissional_terapeuta_id_fkey` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pessoa_juridica` ADD CONSTRAINT `pessoa_juridica_endereco_id_fkey` FOREIGN KEY (`endereco_id`) REFERENCES `endereco`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pessoa_juridica` ADD CONSTRAINT `pessoa_juridica_terapeuta_id_fkey` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessao_trial` ADD CONSTRAINT `sessao_trial_sessao_id_fkey` FOREIGN KEY (`sessao_id`) REFERENCES `sessao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessao_trial` ADD CONSTRAINT `sessao_trial_estimulos_ocp_id_fkey` FOREIGN KEY (`estimulos_ocp_id`) REFERENCES `estimulo_ocp`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessao` ADD CONSTRAINT `sessao_ocp_id_fkey` FOREIGN KEY (`ocp_id`) REFERENCES `ocp`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessao` ADD CONSTRAINT `sessao_terapeuta_id_fkey` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessao` ADD CONSTRAINT `sessao_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estimulo_ocp` ADD CONSTRAINT `estimulo_ocp_id_estimulo_fkey` FOREIGN KEY (`id_estimulo`) REFERENCES `estimulo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estimulo_ocp` ADD CONSTRAINT `estimulo_ocp_id_ocp_fkey` FOREIGN KEY (`id_ocp`) REFERENCES `ocp`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ocp` ADD CONSTRAINT `ocp_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ocp` ADD CONSTRAINT `ocp_criador_id_fkey` FOREIGN KEY (`criador_id`) REFERENCES `terapeuta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `terapeuta_cliente` ADD CONSTRAINT `terapeuta_cliente_terapeuta_id_fkey` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `terapeuta_cliente` ADD CONSTRAINT `terapeuta_cliente_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_disciplinaToterapeuta` ADD CONSTRAINT `_disciplinaToterapeuta_A_fkey` FOREIGN KEY (`A`) REFERENCES `disciplina`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_disciplinaToterapeuta` ADD CONSTRAINT `_disciplinaToterapeuta_B_fkey` FOREIGN KEY (`B`) REFERENCES `terapeuta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
