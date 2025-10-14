/*
  Warnings:

  - You are about to drop the column `area_atuacao` on the `registro_profissional` table. All the data in the column will be lost.
  - You are about to drop the column `cargo` on the `registro_profissional` table. All the data in the column will be lost.
  - Added the required column `area_atuacao_id` to the `registro_profissional` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `registro_profissional_area_atuacao_idx` ON `registro_profissional`;

-- AlterTable
ALTER TABLE `registro_profissional` DROP COLUMN `area_atuacao`,
    DROP COLUMN `cargo`,
    ADD COLUMN `area_atuacao_id` INTEGER NOT NULL,
    ADD COLUMN `cargo_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `registro_profissional_area_atuacao_id_idx` ON `registro_profissional`(`area_atuacao_id`);

-- CreateIndex
CREATE INDEX `registro_profissional_cargo_id_idx` ON `registro_profissional`(`cargo_id`);

-- AddForeignKey
ALTER TABLE `registro_profissional` ADD CONSTRAINT `registro_profissional_area_atuacao_id_fkey` FOREIGN KEY (`area_atuacao_id`) REFERENCES `area_atuacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registro_profissional` ADD CONSTRAINT `registro_profissional_cargo_id_fkey` FOREIGN KEY (`cargo_id`) REFERENCES `cargo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
