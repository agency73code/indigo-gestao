-- AddForeignKey
ALTER TABLE `ata_reuniao` ADD CONSTRAINT `ata_reuniao_terapeuta_id_fkey` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ata_reuniao` ADD CONSTRAINT `ata_reuniao_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ata_participante` ADD CONSTRAINT `ata_participante_terapeuta_id_fkey` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
