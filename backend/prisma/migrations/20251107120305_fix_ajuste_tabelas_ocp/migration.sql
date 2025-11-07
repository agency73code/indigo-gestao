/*
  Warnings:

  - You are about to drop the column `descricao` on the `estimulo` table. All the data in the column will be lost.
  - You are about to drop the column `descricao` on the `estimulo_ocp` table. All the data in the column will be lost.
  - You are about to drop the column `criador_id` on the `ocp` table. All the data in the column will be lost.
  - You are about to drop the column `dominio_criterio` on the `ocp` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_estimulo,id_ocp]` on the table `estimulo_ocp` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `terapeuta_id` to the `ocp` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ocp` DROP FOREIGN KEY `ocp_criador_id_fkey`;

-- DropIndex
DROP INDEX `ocp_criador_id_fkey` ON `ocp`;

-- AlterTable
ALTER TABLE `estimulo` DROP COLUMN `descricao`;

-- AlterTable
ALTER TABLE `estimulo_ocp` DROP COLUMN `descricao`;

-- AlterTable
ALTER TABLE `ocp` DROP COLUMN `criador_id`,
    DROP COLUMN `dominio_criterio`,
    ADD COLUMN `criterio_aprendizagem` TEXT NULL,
    ADD COLUMN `descricao_aplicacao` TEXT NULL,
    ADD COLUMN `objetivo_curto` TEXT NULL,
    ADD COLUMN `terapeuta_id` VARCHAR(191) NOT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'ativado';

-- AlterTable
ALTER TABLE `sessao` ADD COLUMN `observacoes_sessao` TEXT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `estimulo_ocp_id_estimulo_id_ocp_key` ON `estimulo_ocp`(`id_estimulo`, `id_ocp`);

-- CreateIndex
CREATE INDEX `ocp_terapeuta_id_fkey` ON `ocp`(`terapeuta_id`);

-- CreateIndex
CREATE INDEX `vinculo_supervisao_supervisor_id_idx` ON `vinculo_supervisao`(`supervisor_id`);

-- AddForeignKey
ALTER TABLE `ocp` ADD CONSTRAINT `ocp_terapeuta_id_fkey` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
