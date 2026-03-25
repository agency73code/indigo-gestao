-- AlterTable
ALTER TABLE `dados_escola` MODIFY `tipoEscola` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `terapeuta_cliente` ALTER COLUMN `valor_sessao_consultorio` DROP DEFAULT,
    ALTER COLUMN `valor_sessao_homecare` DROP DEFAULT,
    ALTER COLUMN `valor_hora_desenvolvimento_materiais` DROP DEFAULT,
    ALTER COLUMN `valor_hora_supervisao_recebida` DROP DEFAULT,
    ALTER COLUMN `valor_hora_supervisao_dada` DROP DEFAULT,
    ALTER COLUMN `valor_hora_reuniao` DROP DEFAULT;
