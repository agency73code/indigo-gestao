/*
  Warnings:

  - You are about to alter the column `valor_carga` on the `sessao_trial` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.

*/
-- AlterTable
ALTER TABLE `sessao_trial` MODIFY `valor_carga` DOUBLE NULL;
