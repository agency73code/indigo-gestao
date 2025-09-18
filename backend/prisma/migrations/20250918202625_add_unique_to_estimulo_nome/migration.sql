/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `estimulo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `cliente` MODIFY `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `atualizado_em` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `cliente_endereco` MODIFY `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `atualizado_em` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `endereco` MODIFY `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `atualizado_em` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `escola` MODIFY `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `atualizado_em` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `escola_endereco` MODIFY `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `atualizado_em` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `ocp` MODIFY `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `pagamentos` MODIFY `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `atualizado_em` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `responsaveis` MODIFY `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `atualizado_em` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `sessao` MODIFY `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `terapeuta` MODIFY `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `atualizado_em` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `terapeuta_endereco` MODIFY `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `atualizado_em` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `estimulo_nome_key` ON `estimulo`(`nome`);
