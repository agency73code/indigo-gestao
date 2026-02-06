-- AlterTable
ALTER TABLE `terapeuta` ADD COLUMN `valor_hora_desenvolvimento_materiais` DECIMAL(10, 2) NULL,
    ADD COLUMN `valor_hora_reuniao` DECIMAL(10, 2) NULL,
    ADD COLUMN `valor_hora_supervisao_dada` DECIMAL(10, 2) NULL,
    ADD COLUMN `valor_hora_supervisao_recebida` DECIMAL(10, 2) NULL,
    ADD COLUMN `valor_sessao_consultorio` DECIMAL(10, 2) NULL,
    ADD COLUMN `valor_sessao_homecare` DECIMAL(10, 2) NULL;
