-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema gestao_indigo
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `gestao_indigo` ;

-- -----------------------------------------------------
-- Schema gestao_indigo
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `gestao_indigo` DEFAULT CHARACTER SET utf8mb4 ;
USE `gestao_indigo` ;

-- -----------------------------------------------------
-- Table `gestao_indigo`.`terapeuta`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `gestao_indigo`.`terapeuta` ;

CREATE TABLE IF NOT EXISTS `gestao_indigo`.`terapeuta` (
  `id` CHAR(36) NOT NULL,
  `nome` VARCHAR(255) NOT NULL,
  `cpf` CHAR(11) NOT NULL,
  `data_nascimento` DATE NOT NULL,
  `telefone` VARCHAR(20) NULL,
  `celular` VARCHAR(20) NOT NULL,
  `foto_perfil` VARCHAR(255) NULL COMMENT 'Caminho ou URL da foto do terapeuta',
  `email` VARCHAR(255) NOT NULL,
  `email_indigo` VARCHAR(255) NOT NULL,
  `possui_veiculo` ENUM('sim', 'nao') NOT NULL,
  `placa_veiculo` VARCHAR(20) NULL,
  `modelo_veiculo` VARCHAR(50) NULL,
  `banco` VARCHAR(50) NOT NULL,
  `agencia` VARCHAR(20) NOT NULL,
  `conta` VARCHAR(50) NOT NULL,
  `chave_pix` VARCHAR(255) NULL,
  `cnpj_empresa` VARCHAR(14) NULL COMMENT 'CNPJ da empresa do terapeuta (quando possui)',
  `data_entrada` DATE NOT NULL COMMENT 'Não vai ser usado para pesquisa no banco',
  `data_saida` DATE NULL,
  `perfil_acesso` VARCHAR(20) NOT NULL,
  `atividade` ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
  `senha` VARCHAR(255) NULL,
  `token_redefinicao` CHAR(36) NULL,
  `validade_token` DATETIME NULL,
  `criado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Campo de auditoria, não vai receber informações',
  `atualizado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Campo de auditoria, não vai receber informações',
  PRIMARY KEY (`id`),
  UNIQUE KEY `cpf_UNIQUE` (`cpf`),
  UNIQUE KEY `email_indigo_UNIQUE` (`email_indigo`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `cnpj_empresa_UNIQUE` (`cnpj_empresa`),
  INDEX `nome_idx` (`nome`),
  INDEX `atividade_idx` (`atividade`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestao_indigo`.`area_atuacao`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `gestao_indigo`.`area_atuacao` ;

CREATE TABLE IF NOT EXISTS `gestao_indigo`.`area_atuacao` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestao_indigo`.`cargo`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `gestao_indigo`.`cargo` ;

CREATE TABLE IF NOT EXISTS `gestao_indigo`.`cargo` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestao_indigo`.`terapeuta_area_atuacao`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `gestao_indigo`.`terapeuta_area_atuacao` ;

CREATE TABLE IF NOT EXISTS `gestao_indigo`.`terapeuta_area_atuacao` (
  `terapeuta_id` CHAR(36) NOT NULL,
  `area_atuacao_id` INT NOT NULL,
  PRIMARY KEY (`terapeuta_id`, `area_atuacao_id`),
  INDEX `fk_terapeuta_has_area_atuacao_area_atuacao1_idx` (`area_atuacao_id`),
  INDEX `fk_terapeuta_has_area_atuacao_terapeuta_idx` (`terapeuta_id`),
  CONSTRAINT `fk_terapeuta_has_area_atuacao_terapeuta`
    FOREIGN KEY (`terapeuta_id`)
    REFERENCES `gestao_indigo`.`terapeuta` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_terapeuta_has_area_atuacao_area_atuacao1`
    FOREIGN KEY (`area_atuacao_id`)
    REFERENCES `gestao_indigo`.`area_atuacao` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestao_indigo`.`terapeuta_cargo`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `gestao_indigo`.`terapeuta_cargo` ;

CREATE TABLE IF NOT EXISTS `gestao_indigo`.`terapeuta_cargo` (
  `terapeuta_id` CHAR(36) NOT NULL,
  `cargo_id` INT NOT NULL,
  `numero_conselho` VARCHAR(50) NULL,
  `data_entrada` DATE NOT NULL,
  `data_saida` DATE NULL,
  PRIMARY KEY (`terapeuta_id`, `cargo_id`),
  INDEX `fk_terapeuta_has_cargo_cargo1_idx` (`cargo_id`),
  INDEX `fk_terapeuta_has_cargo_terapeuta1_idx` (`terapeuta_id`),
  CONSTRAINT `fk_terapeuta_has_cargo_terapeuta1`
    FOREIGN KEY (`terapeuta_id`)
    REFERENCES `gestao_indigo`.`terapeuta` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_terapeuta_has_cargo_cargo1`
    FOREIGN KEY (`cargo_id`)
    REFERENCES `gestao_indigo`.`cargo` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestao_indigo`.`documentos_terapeuta`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `gestao_indigo`.`documentos_terapeuta` ;

CREATE TABLE IF NOT EXISTS `gestao_indigo`.`documentos_terapeuta` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `terapeuta_id` CHAR(36) NOT NULL,
  `tipo_documento` VARCHAR(50) NOT NULL,
  `caminho_arquivo` VARCHAR(255) NOT NULL,
  `data_upload` DATE NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_documentos_terapeuta_terapeuta1_idx` (`terapeuta_id`),
  CONSTRAINT `fk_documentos_terapeuta_terapeuta1`
    FOREIGN KEY (`terapeuta_id`)
    REFERENCES `gestao_indigo`.`terapeuta` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestao_indigo`.`cliente`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `gestao_indigo`.`cliente` ;

CREATE TABLE IF NOT EXISTS `gestao_indigo`.`cliente` (
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
  `validade_token` DATETIME NULL,
  `criado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `nome_idx` (`nome`),
  UNIQUE INDEX `email_contato_UNIQUE` (`email_contato`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestao_indigo`.`responsaveis`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `gestao_indigo`.`responsaveis` ;

CREATE TABLE IF NOT EXISTS `gestao_indigo`.`responsaveis` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(150) NOT NULL,
  `cpf` CHAR(11) NOT NULL,
  `telefone` VARCHAR(20) NULL,
  `email` VARCHAR(255) NULL,
  `criado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `cpf_UNIQUE` (`cpf`),
  INDEX `nome_idx` (`nome`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestao_indigo`.`cliente_responsavel`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `gestao_indigo`.`cliente_responsavel` ;

CREATE TABLE IF NOT EXISTS `gestao_indigo`.`cliente_responsavel` (
  `cliente_id` CHAR(36) NOT NULL,
  `responsaveis_id` INT NOT NULL,
  `parentesco` ENUM('mae', 'pai', 'responsavel_legal', 'outro') NOT NULL,
  `prioridade` TINYINT NOT NULL DEFAULT 1,
  INDEX `fk_cliente_has_responsaveis_responsaveis1_idx` (`responsaveis_id`),
  INDEX `fk_cliente_has_responsaveis_cliente1_idx` (`cliente_id`),
  INDEX `parentesco_idx` (`parentesco`),
  PRIMARY KEY (`cliente_id`, `responsaveis_id`),
  CONSTRAINT `fk_cliente_has_responsaveis_cliente1`
    FOREIGN KEY (`cliente_id`)
    REFERENCES `gestao_indigo`.`cliente` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_cliente_has_responsaveis_responsaveis1`
    FOREIGN KEY (`responsaveis_id`)
    REFERENCES `gestao_indigo`.`responsaveis` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestao_indigo`.`pagamentos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `gestao_indigo`.`pagamentos` ;

CREATE TABLE IF NOT EXISTS `gestao_indigo`.`pagamentos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cliente_id` CHAR(36) NOT NULL,
  `nome` VARCHAR(150) NULL,
  `numero_carteirinha` VARCHAR(50) NULL,
  `tipo_sistema` ENUM('reembolso', 'liminar', 'particular') NOT NULL,
  `prazo_reembolso_dias` INT NULL,
  `numero_processo` VARCHAR(50) NULL,
  `nome_advogado` VARCHAR(150) NULL,
  `valor_sessao` DECIMAL(10,2) NULL,
  `criado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_pagamentos_cliente1_idx` (`cliente_id`),
  CONSTRAINT `fk_pagamentos_cliente1`
    FOREIGN KEY (`cliente_id`)
    REFERENCES `gestao_indigo`.`cliente` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestao_indigo`.`pagamento_contatos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `gestao_indigo`.`pagamento_contatos` ;

CREATE TABLE IF NOT EXISTS `gestao_indigo`.`pagamento_contatos` (
  `contato_id` INT NOT NULL AUTO_INCREMENT,
  `pagamentos_id` INT NOT NULL,
  `categoria` ENUM('geral', 'advogado', 'outro') NOT NULL DEFAULT 'geral',
  `tipo` ENUM('telefone', 'email') NOT NULL,
  `valor` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`contato_id`),
  INDEX `fk_pagamento_contatos_pagamentos1_idx` (`pagamentos_id`),
  CONSTRAINT `fk_pagamento_contatos_pagamentos1`
    FOREIGN KEY (`pagamentos_id`)
    REFERENCES `gestao_indigo`.`pagamentos` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestao_indigo`.`escola`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `gestao_indigo`.`escola` ;

CREATE TABLE IF NOT EXISTS `gestao_indigo`.`escola` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo_escola` ENUM('particular', 'publica') NOT NULL,
  `nome` VARCHAR(150) NOT NULL,
  `telefone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `criado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestao_indigo`.`cliente_escola`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `gestao_indigo`.`cliente_escola` ;

CREATE TABLE IF NOT EXISTS `gestao_indigo`.`cliente_escola` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cliente_id` CHAR(36) NOT NULL,
  `escola_id` INT NOT NULL,
  INDEX `fk_cliente_has_escolas_escola1_idx` (`escola_id`),
  INDEX `fk_cliente_has_escolas_cliente1_idx` (`cliente_id`),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `cliente_escola` (`cliente_id` ASC, `escola_id`),
  CONSTRAINT `fk_cliente_has_escola_cliente1`
    FOREIGN KEY (`cliente_id`)
    REFERENCES `gestao_indigo`.`cliente` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_cliente_has_escola_escola1`
    FOREIGN KEY (`escola_id`)
    REFERENCES `gestao_indigo`.`escola` (`id`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestao_indigo`.`endereco`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `gestao_indigo`.`endereco` ;

CREATE TABLE IF NOT EXISTS `gestao_indigo`.`endereco` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cep` CHAR(8) NOT NULL,
  `logradouro` VARCHAR(255) NOT NULL,
  `numero` VARCHAR(10) NOT NULL,
  `bairro` VARCHAR(100) NOT NULL,
  `cidade` VARCHAR(100) NOT NULL,
  `uf` CHAR(2) NOT NULL,
  `complemento` VARCHAR(100) NULL,
  `criado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `cep_idx` (`cep`),
  INDEX `cidade_uf_idx` (`cidade`, `uf`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestao_indigo`.`tipo_endereco`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `gestao_indigo`.`tipo_endereco` ;

CREATE TABLE IF NOT EXISTS `gestao_indigo`.`tipo_endereco` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo` VARCHAR(30) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `tipo_UNIQUE` (`tipo`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestao_indigo`.`cliente_endereco`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `gestao_indigo`.`cliente_endereco` ;

CREATE TABLE IF NOT EXISTS `gestao_indigo`.`cliente_endereco` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cliente_id` CHAR(36) NOT NULL,
  `endereco_id` INT NOT NULL,
  `tipo_endereco_id` INT NOT NULL,
  `principal` TINYINT NOT NULL DEFAULT 0,
  `criado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `fk_cliente_has_endereco_endereco1_idx` (`endereco_id`),
  INDEX `fk_cliente_has_endereco_cliente1_idx` (`cliente_id`),
  PRIMARY KEY (`id`),
  INDEX `fk_cliente_endereco_tipo_endereco1_idx` (`tipo_endereco_id`),
  INDEX `cliente_principal_idx` (`cliente_id` ASC, `principal`),
  UNIQUE INDEX `uk_cli_end_tipo` (`cliente_id` ASC, `endereco_id` ASC, `tipo_endereco_id`),
  CONSTRAINT `fk_cliente_has_endereco_cliente1`
    FOREIGN KEY (`cliente_id`)
    REFERENCES `gestao_indigo`.`cliente` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_cliente_has_endereco_endereco1`
    FOREIGN KEY (`endereco_id`)
    REFERENCES `gestao_indigo`.`endereco` (`id`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_cliente_endereco_tipo_endereco1`
    FOREIGN KEY (`tipo_endereco_id`)
    REFERENCES `gestao_indigo`.`tipo_endereco` (`id`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestao_indigo`.`escola_endereco`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `gestao_indigo`.`escola_endereco` ;

CREATE TABLE IF NOT EXISTS `gestao_indigo`.`escola_endereco` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `escola_id` INT NOT NULL,
  `endereco_id` INT NOT NULL,
  `tipo_endereco_id` INT NOT NULL,
  `principal` TINYINT NOT NULL DEFAULT 0,
  `criado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_escola_has_endereco_endereco1_idx` (`endereco_id`),
  INDEX `fk_escola_has_endereco_escola1_idx` (`escola_id`),
  INDEX `fk_escola_endereco_tipo_endereco1_idx` (`tipo_endereco_id`),
  INDEX `escola_principal_idx` (`escola_id` ASC, `principal`),
  UNIQUE INDEX `uk_esc_end_tipo` (`escola_id` ASC, `endereco_id` ASC, `tipo_endereco_id`),
  CONSTRAINT `fk_escola_has_endereco_escola1`
    FOREIGN KEY (`escola_id`)
    REFERENCES `gestao_indigo`.`escola` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_escola_has_endereco_endereco1`
    FOREIGN KEY (`endereco_id`)
    REFERENCES `gestao_indigo`.`endereco` (`id`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_escola_endereco_tipo_endereco1`
    FOREIGN KEY (`tipo_endereco_id`)
    REFERENCES `gestao_indigo`.`tipo_endereco` (`id`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gestao_indigo`.`terapeuta_endereco`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `gestao_indigo`.`terapeuta_endereco` ;

CREATE TABLE IF NOT EXISTS `gestao_indigo`.`terapeuta_endereco` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `terapeuta_id` CHAR(36) NOT NULL,
  `endereco_id` INT NOT NULL,
  `tipo_endereco_id` INT NOT NULL,
  `principal` TINYINT NOT NULL DEFAULT 0,
  `criado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_terapeuta_has_endereco_endereco1_idx` (`endereco_id`),
  INDEX `fk_terapeuta_has_endereco_terapeuta1_idx` (`terapeuta_id`),
  INDEX `fk_terapeuta_endereco_tipo_endereco1_idx` (`tipo_endereco_id`),
  INDEX `terapeuta_principal_idx` (`terapeuta_id` ASC, `principal`),
  UNIQUE INDEX `uk_ter_end_tipo` (`terapeuta_id` ASC, `endereco_id` ASC, `tipo_endereco_id`),
  CONSTRAINT `fk_terapeuta_has_endereco_terapeuta1`
    FOREIGN KEY (`terapeuta_id`)
    REFERENCES `gestao_indigo`.`terapeuta` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_terapeuta_has_endereco_endereco1`
    FOREIGN KEY (`endereco_id`)
    REFERENCES `gestao_indigo`.`endereco` (`id`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_terapeuta_endereco_tipo_endereco1`
    FOREIGN KEY (`tipo_endereco_id`)
    REFERENCES `gestao_indigo`.`tipo_endereco` (`id`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
