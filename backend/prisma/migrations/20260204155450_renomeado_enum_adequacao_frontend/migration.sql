/*
  Warnings:

  - The values [hora_reuniao,hora_supervisao_recebida,hora_supervisao_dada,hora_desenvolvimento_materiais] on the enum `faturamento_tipo_atendimento` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `faturamento` MODIFY `tipo_atendimento` ENUM('consultorio', 'homecare', 'reuniao', 'supervisao_recebida', 'supervisao_dada', 'desenvolvimento_materiais') NOT NULL;
