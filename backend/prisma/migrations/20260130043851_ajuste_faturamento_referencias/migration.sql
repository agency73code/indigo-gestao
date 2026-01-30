-- AddForeignKey
ALTER TABLE `faturamento` ADD CONSTRAINT `faturamento_terapeuta_id_fkey` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faturamento` ADD CONSTRAINT `faturamento_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
