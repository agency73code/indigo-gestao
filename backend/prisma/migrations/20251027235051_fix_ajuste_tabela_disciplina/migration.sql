/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `disciplina` will be added. If there are existing duplicate values, this will fail.
  - Made the column `nome` on table `disciplina` required. This step will fail if there are existing NULL values in that column.
  - Made the column `complemento` on table `endereco` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `disciplina` MODIFY `nome` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `endereco` MODIFY `complemento` VARCHAR(191) NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX `disciplina_nome_key` ON `disciplina`(`nome`);
