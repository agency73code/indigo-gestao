-- AlterTable
ALTER TABLE `faturamento` MODIFY `tipo_atendimento` ENUM('consultorio', 'homecare', 'hora_reuniao', 'hora_supervisao_recebida', 'hora_supervisao_dada', 'hora_desenvolvimento_materiais') NOT NULL;

-- AddForeignKey
ALTER TABLE `ata_anexo` ADD CONSTRAINT `ata_anexo_ata_reuniao_id_fkey` FOREIGN KEY (`ata_reuniao_id`) REFERENCES `ata_reuniao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
