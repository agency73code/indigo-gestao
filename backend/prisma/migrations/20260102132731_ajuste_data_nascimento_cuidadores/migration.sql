/*
  Warnings:

  - Made the column `dataNascimento` on table `cuidador` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `cuidador` MODIFY `dataNascimento` DATE NOT NULL;
