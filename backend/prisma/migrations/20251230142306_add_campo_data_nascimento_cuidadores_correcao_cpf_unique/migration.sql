-- DropIndex
DROP INDEX `cuidador_cpf_key` ON `cuidador`;

-- AlterTable
ALTER TABLE `cuidador` ADD COLUMN `dataNascimento` DATETIME(3) NULL;
