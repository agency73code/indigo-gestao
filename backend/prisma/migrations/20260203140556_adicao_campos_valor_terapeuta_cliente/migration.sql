/*
  Warnings:

  - You are about to drop the column `area_atuacao` on the `terapeuta_cliente` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[terapeuta_id,cliente_id]` on the table `terapeuta_cliente` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `area_atuacao_id` to the `terapeuta_cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valor_sessao` to the `terapeuta_cliente` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `terapeuta_cliente` DROP COLUMN `area_atuacao`,
    ADD COLUMN `area_atuacao_id` INTEGER NOT NULL,
    ADD COLUMN `valor_sessao` DECIMAL(10, 2) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `terapeuta_cliente_terapeuta_id_cliente_id_key` ON `terapeuta_cliente`(`terapeuta_id`, `cliente_id`);

-- AddForeignKey
ALTER TABLE `terapeuta_cliente` ADD CONSTRAINT `terapeuta_cliente_area_atuacao_id_fkey` FOREIGN KEY (`area_atuacao_id`) REFERENCES `area_atuacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
