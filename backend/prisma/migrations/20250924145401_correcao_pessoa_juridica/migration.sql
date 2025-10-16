-- AlterTable
ALTER TABLE `estimulo` MODIFY `descricao` TEXT NULL;

-- AlterTable
ALTER TABLE `estimulo_ocp` MODIFY `descricao` TEXT NULL;

-- AlterTable
ALTER TABLE `ocp` MODIFY `objetivo_descricao` TEXT NULL,
    MODIFY `dominio_criterio` TEXT NULL,
    MODIFY `observacao_geral` TEXT NULL;

-- AlterTable
ALTER TABLE `pessoa_juridica` MODIFY `cnpj` VARCHAR(191) NULL;
