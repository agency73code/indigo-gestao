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
  `cep_endereco` CHAR(8) NOT NULL,
  `logradouro_endereco` VARCHAR(255) NOT NULL,
  `numero_endereco` VARCHAR(10) NOT NULL,
  `bairro_endereco` VARCHAR(100) NOT NULL,
  `cidade_endereco` VARCHAR(100) NOT NULL,
  `uf_endereco` CHAR(2) NOT NULL,
  `complemento_endereco` VARCHAR(100) NULL,
  `cnpj_empresa` VARCHAR(14) NULL COMMENT 'CNPJ da empresa do terapeuta (quando possui)',
  `cep_empresa` CHAR(8) NULL,
  `logradouro_empresa` VARCHAR(255) NULL,
  `numero_empresa` VARCHAR(10) NULL,
  `bairro_empresa` VARCHAR(100) NULL,
  `cidade_empresa` VARCHAR(100) NULL,
  `uf_empresa` CHAR(2) NULL,
  `complemento_empresa` VARCHAR(100) NULL,
  `data_entrada` DATE NOT NULL COMMENT 'Não vai ser usado para pesquisa no banco',
  `data_saida` DATE NULL,
  `perfil_acesso` VARCHAR(20) NOT NULL,
  `atividade` ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
  `criado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Campo de auditoria, não vai receber informações',
  `atualizado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Campo de auditoria, não vai receber informações',
  `senha` VARCHAR(255) NULL,
  `token_redefinicao` VARCHAR(255) NULL,
  `validade_token` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cpf_UNIQUE` (`cpf`),
  UNIQUE KEY `email_indigo_UNIQUE` (`email_indigo`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `cnpj_empresa_UNIQUE` (`cnpj_empresa`),
  INDEX `nome_idx` (`nome`),
  INDEX `atividade_idx` (`atividade`),
  INDEX `cidade_endereco_idx` (`cidade_endereco`))
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


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
