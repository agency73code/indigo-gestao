-- AddForeignKey
ALTER TABLE `terapeuta_cliente` ADD CONSTRAINT `terapeuta_cliente_terapeuta_id_fkey` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
