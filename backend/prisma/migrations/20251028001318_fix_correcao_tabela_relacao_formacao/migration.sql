/*
  Warnings:

  - A unique constraint covering the columns `[terapeuta_id]` on the table `formacao` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `formacao_terapeuta_id_key` ON `formacao`(`terapeuta_id`);
