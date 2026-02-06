-- DropForeignKey
ALTER TABLE `ata_anexo` DROP FOREIGN KEY `ata_anexo_ata_reuniao_id_fkey`;

-- DropIndex
DROP INDEX `ata_anexo_ata_reuniao_id_key` ON `ata_anexo`;

-- AddForeignKey
ALTER TABLE `anamnese_terapia_previa` ADD CONSTRAINT `fkey_anamnese_terapia_previa_anamnese_id` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese_queixa_diagnostico`(`anamnese_id`) ON DELETE CASCADE ON UPDATE CASCADE;
