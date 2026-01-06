-- DropForeignKey
ALTER TABLE `anamnese_atividades_vida_diaria` DROP FOREIGN KEY `anamnese_atividades_vida_diaria_anamnese_id_fkey`;

-- DropForeignKey
ALTER TABLE `anamnese_comportamento` DROP FOREIGN KEY `anamnese_comportamento_anamnese_id_fkey`;

-- DropForeignKey
ALTER TABLE `anamnese_contexto_familiar_rotina` DROP FOREIGN KEY `anamnese_contexto_familiar_rotina_anamnese_id_fkey`;

-- DropForeignKey
ALTER TABLE `anamnese_desenvolvimento_inicial` DROP FOREIGN KEY `anamnese_desenvolvimento_inicial_anamnese_id_fkey`;

-- DropForeignKey
ALTER TABLE `anamnese_finalizacao` DROP FOREIGN KEY `anamnese_finalizacao_anamnese_id_fkey`;

-- DropForeignKey
ALTER TABLE `anamnese_queixa_diagnostico` DROP FOREIGN KEY `anamnese_queixa_diagnostico_anamnese_id_fkey`;

-- DropForeignKey
ALTER TABLE `anamnese_social_academico` DROP FOREIGN KEY `anamnese_social_academico_anamnese_id_fkey`;

-- AddForeignKey
ALTER TABLE `anamnese_queixa_diagnostico` ADD CONSTRAINT `anamnese_queixa_diagnostico_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_contexto_familiar_rotina` ADD CONSTRAINT `anamnese_contexto_familiar_rotina_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_desenvolvimento_inicial` ADD CONSTRAINT `anamnese_desenvolvimento_inicial_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_atividades_vida_diaria` ADD CONSTRAINT `anamnese_atividades_vida_diaria_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_social_academico` ADD CONSTRAINT `anamnese_social_academico_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_comportamento` ADD CONSTRAINT `anamnese_comportamento_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_finalizacao` ADD CONSTRAINT `anamnese_finalizacao_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
