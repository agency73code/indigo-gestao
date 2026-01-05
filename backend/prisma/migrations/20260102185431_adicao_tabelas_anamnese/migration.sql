-- CreateTable
CREATE TABLE `anamnese` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cliente_id` VARCHAR(191) NOT NULL,
    `terapeuta_id` VARCHAR(191) NOT NULL,
    `data_entrevista` DATETIME(3) NOT NULL,
    `informante` VARCHAR(191) NOT NULL,
    `parentesco` VARCHAR(191) NOT NULL,
    `parentesco_descricao` VARCHAR(191) NULL,
    `quem_indicou` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_queixa_diagnostico` (
    `anamnese_id` INTEGER NOT NULL,
    `queixa_principal` VARCHAR(191) NOT NULL,
    `diagnostico_previo` VARCHAR(191) NULL,
    `suspeita_condicao_associada` VARCHAR(191) NULL,

    INDEX `anamnese_queixa_diagnostico_anamnese_id_idx`(`anamnese_id`),
    PRIMARY KEY (`anamnese_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_especialidade_consultada` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anamnese_id` INTEGER NOT NULL,
    `especialidade` VARCHAR(191) NULL,
    `nome` VARCHAR(191) NULL,
    `data` VARCHAR(191) NULL,
    `observacao` VARCHAR(191) NULL,
    `ativo` BOOLEAN NULL DEFAULT true,

    INDEX `anamnese_especialidade_consultada_anamnese_id_idx`(`anamnese_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_medicamento_em_uso` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anamnese_id` INTEGER NOT NULL,
    `nome` VARCHAR(191) NULL,
    `dosagem` VARCHAR(191) NULL,
    `data_inicio` VARCHAR(191) NULL,
    `motivo` VARCHAR(191) NULL,

    INDEX `anamnese_medicamento_em_uso_anamnese_id_idx`(`anamnese_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_exame_previo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anamnese_id` INTEGER NOT NULL,
    `nome` VARCHAR(191) NULL,
    `data` VARCHAR(191) NULL,
    `resultado` VARCHAR(191) NULL,

    INDEX `anamnese_exame_previo_anamnese_id_idx`(`anamnese_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_arquivo_exame_previo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `exame_id` INTEGER NOT NULL,
    `nome` VARCHAR(191) NULL,
    `caminho` VARCHAR(191) NULL,
    `tipo` VARCHAR(191) NULL,
    `tamanho` INTEGER NULL,

    INDEX `anamnese_arquivo_exame_previo_exame_id_idx`(`exame_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_terapia_previa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anamnese_id` INTEGER NOT NULL,
    `profissional` VARCHAR(191) NULL,
    `especialidade_abordagem` VARCHAR(191) NULL,
    `tempo_intervencao` VARCHAR(191) NULL,
    `observacao` VARCHAR(191) NULL,
    `ativo` BOOLEAN NULL DEFAULT true,

    INDEX `anamnese_terapia_previa_anamnese_id_idx`(`anamnese_id`),
    INDEX `anamnese_terapia_previa_profissional_idx`(`profissional`),
    INDEX `anamnese_terapia_previa_especialidade_abordagem_idx`(`especialidade_abordagem`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_contexto_familiar_rotina` (
    `anamnese_id` INTEGER NOT NULL,

    INDEX `anamnese_contexto_familiar_rotina_anamnese_id_idx`(`anamnese_id`),
    PRIMARY KEY (`anamnese_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_historico_familiar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contexto_id` INTEGER NOT NULL,
    `condicao_diagnostico` VARCHAR(191) NULL,
    `parentesco` VARCHAR(191) NULL,
    `observacao` VARCHAR(191) NULL,

    INDEX `anamnese_historico_familiar_contexto_id_idx`(`contexto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_atividade_rotina` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contexto_id` INTEGER NOT NULL,
    `atividade` VARCHAR(191) NULL,
    `horario` VARCHAR(191) NULL,
    `responsavel` VARCHAR(191) NULL,
    `frequencia` VARCHAR(191) NULL,
    `observacao` VARCHAR(191) NULL,

    INDEX `anamnese_atividade_rotina_contexto_id_idx`(`contexto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_desenvolvimento_inicial` (
    `anamnese_id` INTEGER NOT NULL,
    `tipo_parto` VARCHAR(191) NOT NULL,
    `semanas` INTEGER NOT NULL,
    `apgar_1_min` INTEGER NOT NULL,
    `apgar_5_min` INTEGER NOT NULL,
    `intercorrencias` VARCHAR(191) NULL,
    `sustentou_cabeca_meses` VARCHAR(191) NULL,
    `sustentou_cabeca_nao_realiza` BOOLEAN NULL,
    `sustentou_cabeca_nao_soube_informar` BOOLEAN NULL,
    `rolou_meses` VARCHAR(191) NULL,
    `rolou_nao_realiza` BOOLEAN NULL,
    `rolou_nao_soube_informar` BOOLEAN NULL,
    `sentou_meses` VARCHAR(191) NULL,
    `sentou_nao_realiza` BOOLEAN NULL,
    `sentou_nao_soube_informar` BOOLEAN NULL,
    `engatinhou_meses` VARCHAR(191) NULL,
    `engatinhou_nao_realiza` BOOLEAN NULL,
    `engatinhou_nao_soube_informar` BOOLEAN NULL,
    `andou_com_apoio_meses` VARCHAR(191) NULL,
    `andou_com_apoio_nao_realiza` BOOLEAN NULL,
    `andou_com_apoio_nao_soube_informar` BOOLEAN NULL,
    `andou_sem_apoio_meses` VARCHAR(191) NULL,
    `andou_sem_apoio_nao_realiza` BOOLEAN NULL,
    `andou_sem_apoio_nao_soube_informar` BOOLEAN NULL,
    `correu_meses` VARCHAR(191) NULL,
    `correu_nao_realiza` BOOLEAN NULL,
    `correu_nao_soube_informar` BOOLEAN NULL,
    `andou_de_motoca_meses` VARCHAR(191) NULL,
    `andou_de_motoca_nao_realiza` BOOLEAN NULL,
    `andou_de_motoca_nao_soube_informar` BOOLEAN NULL,
    `andou_de_bicicleta_meses` VARCHAR(191) NULL,
    `andou_de_bicicleta_nao_realiza` BOOLEAN NULL,
    `andou_de_bicicleta_nao_soube_informar` BOOLEAN NULL,
    `subiu_escadas_sozinho_meses` VARCHAR(191) NULL,
    `subiu_escadas_sozinho_nao_realiza` BOOLEAN NULL,
    `subiu_escadas_sozinho_nao_soube_informar` BOOLEAN NULL,
    `motricidade_fina` VARCHAR(191) NULL,
    `balbuciou_meses` VARCHAR(191) NULL,
    `balbuciou_nao` BOOLEAN NULL,
    `balbuciou_nao_soube_informar` BOOLEAN NULL,
    `primeiras_palavras_meses` VARCHAR(191) NULL,
    `primeiras_palavras_nao` BOOLEAN NULL,
    `primeiras_palavras_nao_soube_informar` BOOLEAN NULL,
    `primeiras_frases_meses` VARCHAR(191) NULL,
    `primeiras_frases_nao` BOOLEAN NULL,
    `primeiras_frases_nao_soube_informar` BOOLEAN NULL,
    `apontou_para_fazer_pedidos_meses` VARCHAR(191) NULL,
    `apontou_para_fazer_pedidos_nao` BOOLEAN NULL,
    `apontou_para_fazer_pedidos_nao_soube_informar` BOOLEAN NULL,
    `faz_uso_de_gestos` BOOLEAN NULL,
    `faz_uso_de_gestos_quais` VARCHAR(191) NULL,
    `audicao` ENUM('boa', 'ruim') NULL,
    `teve_otite_de_repeticao` BOOLEAN NULL,
    `otite_vezes` INTEGER NULL,
    `otite_periodo_meses` INTEGER NULL,
    `otite_frequencia` VARCHAR(191) NULL,
    `faz_ou_fez_uso_tubo_ventilacao` BOOLEAN NULL,
    `tubo_ventilacao_observacao` VARCHAR(191) NULL,
    `faz_ou_fez_uso_objeto_oral` BOOLEAN NULL,
    `objeto_oral_especificar` VARCHAR(191) NULL,
    `usa_mamadeira` BOOLEAN NULL,
    `mamadeira_ha` VARCHAR(191) NULL,
    `mamadeira_vezes_ao_dia` INTEGER NULL,
    `comunicacao_atual` VARCHAR(191) NULL,

    INDEX `anamnese_desenvolvimento_inicial_anamnese_id_idx`(`anamnese_id`),
    PRIMARY KEY (`anamnese_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_atividades_vida_diaria` (
    `anamnese_id` INTEGER NOT NULL,
    `desfralde_diurno_urina_anos` VARCHAR(191) NULL,
    `desfralde_diurno_urina_meses` VARCHAR(191) NULL,
    `desfralde_diurno_urina_utiliza_fralda` BOOLEAN NULL,
    `desfralde_noturno_urina_anos` VARCHAR(191) NULL,
    `desfralde_noturno_urina_meses` VARCHAR(191) NULL,
    `desfralde_noturno_urina_utiliza_fralda` BOOLEAN NULL,
    `desfralde_fezes_anos` VARCHAR(191) NULL,
    `desfralde_fezes_meses` VARCHAR(191) NULL,
    `desfralde_fezes_utiliza_fralda` BOOLEAN NULL,
    `se_limpa_sozinho_urinar` BOOLEAN NULL,
    `se_limpa_sozinho_defecar` BOOLEAN NULL,
    `lava_as_maos_apos_uso_banheiro` BOOLEAN NULL,
    `apresenta_alteracao_habito_intestinal` BOOLEAN NULL,
    `desfralde_observacoes` VARCHAR(191) NULL,
    `dormem_media_horas_noite` VARCHAR(191) NULL,
    `dormem_media_horas_dia` VARCHAR(191) NULL,
    `periodo_sono_dia` ENUM('manha', 'tarde') NULL,
    `tem_dificuldade_iniciar_sono` BOOLEAN NULL,
    `acorda_de_madrugada` BOOLEAN NULL,
    `dorme_na_propria_cama` BOOLEAN NULL,
    `dorme_no_proprio_quarto` BOOLEAN NULL,
    `apresenta_sono_agitado` BOOLEAN NULL,
    `e_sonambulo` BOOLEAN NULL,
    `sono_observacoes` VARCHAR(191) NULL,
    `toma_banho_lava_corpo_todo` ENUM('sim', 'com_ajuda', 'nao') NULL,
    `seca_corpo_todo` ENUM('sim', 'com_ajuda', 'nao') NULL,
    `retira_todas_pecas_roupa` ENUM('sim', 'com_ajuda', 'nao') NULL,
    `coloca_todas_pecas_roupa` ENUM('sim', 'com_ajuda', 'nao') NULL,
    `poe_calcados_sem_cadarco` ENUM('sim', 'com_ajuda', 'nao') NULL,
    `poe_calcados_com_cadarco` ENUM('sim', 'com_ajuda', 'nao') NULL,
    `escova_os_dentes` ENUM('sim', 'com_ajuda', 'nao') NULL,
    `penteia_o_cabelo` ENUM('sim', 'com_ajuda', 'nao') NULL,
    `habitos_higiene_observacoes` VARCHAR(191) NULL,
    `apresenta_queixa_alimentacao` BOOLEAN NULL,
    `se_alimenta_sozinho` BOOLEAN NULL,
    `e_seletivo_quanto_alimentos` BOOLEAN NULL,
    `passa_dia_inteiro_sem_comer` BOOLEAN NULL,
    `apresenta_rituais_para_alimentar` BOOLEAN NULL,
    `esta_abaixo_ou_acima_peso` BOOLEAN NULL,
    `esta_abaixo_ou_acima_peso_descricao` VARCHAR(191) NULL,
    `tem_historico_anemia` BOOLEAN NULL,
    `tem_historico_anemia_descricao` VARCHAR(191) NULL,
    `rotina_alimentar_problema_familia` BOOLEAN NULL,
    `rotina_alimentar_problema_familia_desc` VARCHAR(191) NULL,
    `alimentacao_observacoes` VARCHAR(191) NULL,

    INDEX `anamnese_atividades_vida_diaria_anamnese_id_idx`(`anamnese_id`),
    PRIMARY KEY (`anamnese_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_social_academico` (
    `anamnese_id` INTEGER NOT NULL,
    `possui_amigos_mesma_idade_escola` BOOLEAN NULL,
    `possui_amigos_mesma_idade_fora_escola` BOOLEAN NULL,
    `faz_uso_funcional_brinquedos` BOOLEAN NULL,
    `brinca_proximo_aos_colegas` BOOLEAN NULL,
    `brinca_conjunta_com_colegas` BOOLEAN NULL,
    `procura_colegas_espontaneamente` BOOLEAN NULL,
    `se_verbal_inicia_conversa` BOOLEAN NULL,
    `se_verbal_responde_perguntas_simples` BOOLEAN NULL,
    `faz_pedidos_quando_necessario` BOOLEAN NULL,
    `estabelece_contato_visual_adultos` BOOLEAN NULL,
    `estabelece_contato_visual_criancas` BOOLEAN NULL,
    `desenvolvimento_social_observacoes` VARCHAR(191) NULL,
    `ano` INTEGER NULL,
    `periodo` VARCHAR(191) NULL,
    `direcao` VARCHAR(191) NULL,
    `coordenacao` VARCHAR(191) NULL,
    `professora_principal` VARCHAR(191) NULL,
    `professora_assistente` VARCHAR(191) NULL,
    `frequenta_escola_regular` BOOLEAN NULL,
    `frequenta_escola_especial` BOOLEAN NULL,
    `acompanha_turma_demandas_pedagogicas` BOOLEAN NULL,
    `segue_regras_rotina_sala_aula` BOOLEAN NULL,
    `necessita_apoio_at` BOOLEAN NULL,
    `necessita_adaptacao_materiais` BOOLEAN NULL,
    `necessita_adaptacao_curricular` BOOLEAN NULL,
    `houve_reprovacao_retencao` BOOLEAN NULL,
    `escola_possui_equipe_inclusao` BOOLEAN NULL,
    `ha_indicativo_deficiencia_intelectual` BOOLEAN NULL,
    `escola_apresenta_queixa_comportamental` BOOLEAN NULL,
    `adaptacao_escolar` VARCHAR(191) NULL,
    `dificuldades_escolares` VARCHAR(191) NULL,
    `relacionamento_com_colegas` VARCHAR(191) NULL,
    `desenvolvimento_academico_observacoes` VARCHAR(191) NULL,

    INDEX `anamnese_social_academico_anamnese_id_idx`(`anamnese_id`),
    PRIMARY KEY (`anamnese_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_comportamento` (
    `anamnese_id` INTEGER NOT NULL,
    `balanca_maos_lado_corpo_ou_frente` BOOLEAN NULL,
    `balanca_corpo_frente_para_tras` BOOLEAN NULL,
    `pula_ou_gira_em_torno_de_si` BOOLEAN NULL,
    `repete_sons_sem_funcao_comunicativa` BOOLEAN NULL,
    `repete_movimentos_continuos` BOOLEAN NULL,
    `explora_ambiente_lambendo_tocando` BOOLEAN NULL,
    `procura_observar_objetos_canto_olho` BOOLEAN NULL,
    `organiza_objetos_lado_a_lado` BOOLEAN NULL,
    `realiza_tarefas_sempre_mesma_ordem` BOOLEAN NULL,
    `apresenta_rituais_diarios` BOOLEAN NULL,
    `estereotipias_rituais_observacoes_topografias` VARCHAR(191) NULL,
    `apresenta_comportamentos_auto_lesivos` BOOLEAN NULL,
    `auto_lesivos_quais` VARCHAR(191) NULL,
    `apresenta_comportamentos_heteroagressivos` BOOLEAN NULL,
    `heteroagressivos_quais` VARCHAR(191) NULL,
    `apresenta_destruicao_propriedade` BOOLEAN NULL,
    `destruicao_descrever` VARCHAR(191) NULL,
    `necessitou_contencao_mecanica` BOOLEAN NULL,
    `problemas_comportamento_observacoes_topografias` VARCHAR(191) NULL,

    INDEX `anamnese_comportamento_anamnese_id_idx`(`anamnese_id`),
    PRIMARY KEY (`anamnese_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_finalizacao` (
    `anamnese_id` INTEGER NOT NULL,
    `outras_informacoes_relevantes` VARCHAR(191) NULL,
    `observacoes_impressoes_terapeuta` VARCHAR(191) NULL,
    `expectativas_familia` VARCHAR(191) NULL,

    INDEX `anamnese_finalizacao_anamnese_id_idx`(`anamnese_id`),
    PRIMARY KEY (`anamnese_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `anamnese` ADD CONSTRAINT `anamnese_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese` ADD CONSTRAINT `anamnese_terapeuta_id_fkey` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_queixa_diagnostico` ADD CONSTRAINT `anamnese_queixa_diagnostico_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_especialidade_consultada` ADD CONSTRAINT `anamnese_especialidade_consultada_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese_queixa_diagnostico`(`anamnese_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_medicamento_em_uso` ADD CONSTRAINT `anamnese_medicamento_em_uso_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese_queixa_diagnostico`(`anamnese_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_exame_previo` ADD CONSTRAINT `anamnese_exame_previo_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese_queixa_diagnostico`(`anamnese_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_arquivo_exame_previo` ADD CONSTRAINT `anamnese_arquivo_exame_previo_exame_id_fkey` FOREIGN KEY (`exame_id`) REFERENCES `anamnese_exame_previo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_terapia_previa` ADD CONSTRAINT `anamnese_terapia_previa_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese_queixa_diagnostico`(`anamnese_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_contexto_familiar_rotina` ADD CONSTRAINT `anamnese_contexto_familiar_rotina_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_historico_familiar` ADD CONSTRAINT `anamnese_historico_familiar_contexto_id_fkey` FOREIGN KEY (`contexto_id`) REFERENCES `anamnese_contexto_familiar_rotina`(`anamnese_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_atividade_rotina` ADD CONSTRAINT `anamnese_atividade_rotina_contexto_id_fkey` FOREIGN KEY (`contexto_id`) REFERENCES `anamnese_contexto_familiar_rotina`(`anamnese_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_desenvolvimento_inicial` ADD CONSTRAINT `anamnese_desenvolvimento_inicial_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_atividades_vida_diaria` ADD CONSTRAINT `anamnese_atividades_vida_diaria_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_social_academico` ADD CONSTRAINT `anamnese_social_academico_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_comportamento` ADD CONSTRAINT `anamnese_comportamento_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_finalizacao` ADD CONSTRAINT `anamnese_finalizacao_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
