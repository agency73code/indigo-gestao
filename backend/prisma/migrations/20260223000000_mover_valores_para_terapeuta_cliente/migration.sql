-- Renomeia valor_sessao para valor_cliente_sessao e adiciona os 6 campos de valor por tipo de atendimento
ALTER TABLE `terapeuta_cliente`
  CHANGE COLUMN `valor_sessao` `valor_cliente_sessao` DECIMAL(10,2) NOT NULL,
  ADD COLUMN `valor_sessao_consultorio`             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN `valor_sessao_homecare`                DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN `valor_hora_desenvolvimento_materiais` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN `valor_hora_supervisao_recebida`       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN `valor_hora_supervisao_dada`           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN `valor_hora_reuniao`                   DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Remove os campos de valor da tabela terapeuta (agora pertencem ao vínculo terapeuta_cliente)
ALTER TABLE `terapeuta`
  DROP COLUMN `valor_hora`,
  DROP COLUMN `valor_sessao_consultorio`,
  DROP COLUMN `valor_sessao_homecare`,
  DROP COLUMN `valor_hora_desenvolvimento_materiais`,
  DROP COLUMN `valor_hora_supervisao_recebida`,
  DROP COLUMN `valor_hora_supervisao_dada`,
  DROP COLUMN `valor_hora_reuniao`;