/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `cuidador` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clienteId,cpf]` on the table `cuidador` will be added. If there are existing duplicate values, this will fail.
  - Made the column `cpf` on table `cuidador` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `cuidador` DROP FOREIGN KEY `cuidador_enderecoId_fkey`;

-- DropIndex
DROP INDEX `cuidador_enderecoId_fkey` ON `cuidador`;

-- AlterTable
ALTER TABLE `cuidador` MODIFY `cpf` CHAR(11) NOT NULL,
    MODIFY `enderecoId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `cuidador_cpf_key` ON `cuidador`(`cpf`);

-- CreateIndex
CREATE UNIQUE INDEX `cuidador_clienteId_cpf_key` ON `cuidador`(`clienteId`, `cpf`);

-- AddForeignKey
ALTER TABLE `cuidador` ADD CONSTRAINT `cuidador_enderecoId_fkey` FOREIGN KEY (`enderecoId`) REFERENCES `endereco`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
