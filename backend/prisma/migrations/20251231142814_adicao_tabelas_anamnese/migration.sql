-- CreateTable
CREATE TABLE `anamnese` (
    `id` VARCHAR(191) NOT NULL,
    `cliente_id` VARCHAR(191) NOT NULL,
    `terapeuta_id` VARCHAR(191) NOT NULL,
    `data_entrevista` DATE NOT NULL,
    `cliente_nome` VARCHAR(191) NOT NULL,
    `cliente_avatar_url` TEXT NULL,
    `data_nascimento` DATE NOT NULL,
    `idade` VARCHAR(191) NOT NULL,
    `informante` VARCHAR(191) NOT NULL,
    `parentesco` VARCHAR(191) NOT NULL,
    `parentesco_descricao` VARCHAR(191) NULL,
    `quem_indicou` VARCHAR(191) NOT NULL,
    `profissional_nome` VARCHAR(191) NOT NULL,
    `escola_cliente` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `queixa_principal` TEXT NOT NULL,
    `diagnostico_previo` TEXT NOT NULL,
    `suspeita_condicao_associada` TEXT NOT NULL,
    `cuidadores_principais` TEXT NULL,
    `tempo_tela` VARCHAR(191) NULL,
    `gestacao_parto_tipo_parto` VARCHAR(191) NULL,
    `gestacao_parto_semanas` INTEGER NULL,
    `gestacao_parto_apgar_1min` INTEGER NULL,
    `gestacao_parto_apgar_5min` INTEGER NULL,
    `gestacao_parto_intercorrencias` TEXT NOT NULL,
    `neuropsicomotor_sustentou_cabeca_meses` VARCHAR(191) NULL,
    `neuropsicomotor_sustentou_cabeca_status` VARCHAR(191) NULL,
    `neuropsicomotor_sustentou_cabeca_nao_realiza` BOOLEAN NULL,
    `neuropsicomotor_sustentou_cabeca_nao_soube_informar` BOOLEAN NULL,
    `neuropsicomotor_sustentou_cabeca_nao` BOOLEAN NULL,
    `neuropsicomotor_rolou_meses` VARCHAR(191) NULL,
    `neuropsicomotor_rolou_status` VARCHAR(191) NULL,
    `neuropsicomotor_rolou_nao_realiza` BOOLEAN NULL,
    `neuropsicomotor_rolou_nao_soube_informar` BOOLEAN NULL,
    `neuropsicomotor_rolou_nao` BOOLEAN NULL,
    `neuropsicomotor_sentou_meses` VARCHAR(191) NULL,
    `neuropsicomotor_sentou_status` VARCHAR(191) NULL,
    `neuropsicomotor_sentou_nao_realiza` BOOLEAN NULL,
    `neuropsicomotor_sentou_nao_soube_informar` BOOLEAN NULL,
    `neuropsicomotor_sentou_nao` BOOLEAN NULL,
    `neuropsicomotor_engatinhou_meses` VARCHAR(191) NULL,
    `neuropsicomotor_engatinhou_status` VARCHAR(191) NULL,
    `neuropsicomotor_engatinhou_nao_realiza` BOOLEAN NULL,
    `neuropsicomotor_engatinhou_nao_soube_informar` BOOLEAN NULL,
    `neuropsicomotor_engatinhou_nao` BOOLEAN NULL,
    `neuropsicomotor_andou_com_apoio_meses` VARCHAR(191) NULL,
    `neuropsicomotor_andou_com_apoio_status` VARCHAR(191) NULL,
    `neuropsicomotor_andou_com_apoio_nao_realiza` BOOLEAN NULL,
    `neuropsicomotor_andou_com_apoio_nao_soube_informar` BOOLEAN NULL,
    `neuropsicomotor_andou_com_apoio_nao` BOOLEAN NULL,
    `neuropsicomotor_andou_sem_apoio_meses` VARCHAR(191) NULL,
    `neuropsicomotor_andou_sem_apoio_status` VARCHAR(191) NULL,
    `neuropsicomotor_andou_sem_apoio_nao_realiza` BOOLEAN NULL,
    `neuropsicomotor_andou_sem_apoio_nao_soube_informar` BOOLEAN NULL,
    `neuropsicomotor_andou_sem_apoio_nao` BOOLEAN NULL,
    `neuropsicomotor_correu_meses` VARCHAR(191) NULL,
    `neuropsicomotor_correu_status` VARCHAR(191) NULL,
    `neuropsicomotor_correu_nao_realiza` BOOLEAN NULL,
    `neuropsicomotor_correu_nao_soube_informar` BOOLEAN NULL,
    `neuropsicomotor_correu_nao` BOOLEAN NULL,
    `neuropsicomotor_andou_de_motoca_meses` VARCHAR(191) NULL,
    `neuropsicomotor_andou_de_motoca_status` VARCHAR(191) NULL,
    `neuropsicomotor_andou_de_motoca_nao_realiza` BOOLEAN NULL,
    `neuropsicomotor_andou_de_motoca_nao_soube_informar` BOOLEAN NULL,
    `neuropsicomotor_andou_de_motoca_nao` BOOLEAN NULL,
    `neuropsicomotor_andou_de_bicicleta_meses` VARCHAR(191) NULL,
    `neuropsicomotor_andou_de_bicicleta_status` VARCHAR(191) NULL,
    `neuropsicomotor_andou_de_bicicleta_nao_realiza` BOOLEAN NULL,
    `neuropsicomotor_andou_de_bicicleta_nao_soube_informar` BOOLEAN NULL,
    `neuropsicomotor_andou_de_bicicleta_nao` BOOLEAN NULL,
    `neuropsicomotor_subiu_escadas_sozinho_meses` VARCHAR(191) NULL,
    `neuropsicomotor_subiu_escadas_sozinho_status` VARCHAR(191) NULL,
    `neuropsicomotor_subiu_escadas_sozinho_nao_realiza` BOOLEAN NULL,
    `neuropsicomotor_subiu_escadas_sozinho_nao_soube_informar` BOOLEAN NULL,
    `neuropsicomotor_subiu_escadas_sozinho_nao` BOOLEAN NULL,
    `neuropsicomotor_motricidade_fina` TEXT NOT NULL,
    `fala_linguagem_balbuciou_meses` VARCHAR(191) NULL,
    `fala_linguagem_balbuciou_status` VARCHAR(191) NULL,
    `fala_linguagem_balbuciou_nao_realiza` BOOLEAN NULL,
    `fala_linguagem_balbuciou_nao_soube_informar` BOOLEAN NULL,
    `fala_linguagem_balbuciou_nao` BOOLEAN NULL,
    `fala_linguagem_primeiras_palavras_meses` VARCHAR(191) NULL,
    `fala_linguagem_primeiras_palavras_status` VARCHAR(191) NULL,
    `fala_linguagem_primeiras_palavras_nao_realiza` BOOLEAN NULL,
    `fala_linguagem_primeiras_palavras_nao_soube_informar` BOOLEAN NULL,
    `fala_linguagem_primeiras_palavras_nao` BOOLEAN NULL,
    `fala_linguagem_primeiras_frases_meses` VARCHAR(191) NULL,
    `fala_linguagem_primeiras_frases_status` VARCHAR(191) NULL,
    `fala_linguagem_primeiras_frases_nao_realiza` BOOLEAN NULL,
    `fala_linguagem_primeiras_frases_nao_soube_informar` BOOLEAN NULL,
    `fala_linguagem_primeiras_frases_nao` BOOLEAN NULL,
    `fala_linguagem_apontou_para_fazer_pedidos_meses` VARCHAR(191) NULL,
    `fala_linguagem_apontou_para_fazer_pedidos_status` VARCHAR(191) NULL,
    `fala_linguagem_apontou_para_fazer_pedidos_nao_realiza` BOOLEAN NULL,
    `fala_linguagem_apontou_para_fazer_pedidos_nao_soube_informar` BOOLEAN NULL,
    `fala_linguagem_apontou_para_fazer_pedidos_nao` BOOLEAN NULL,
    `fala_linguagem_faz_uso_de_gestos` BOOLEAN NULL,
    `fala_linguagem_faz_uso_de_gestos_quais` TEXT NOT NULL,
    `fala_linguagem_audicao` VARCHAR(191) NULL,
    `fala_linguagem_teve_otite_de_repeticao` BOOLEAN NULL,
    `fala_linguagem_otite_vezes` INTEGER NULL,
    `fala_linguagem_otite_periodo_meses` INTEGER NULL,
    `fala_linguagem_otite_frequencia` VARCHAR(191) NULL,
    `fala_linguagem_otite_detalhes` TEXT NULL,
    `fala_linguagem_faz_ou_fez_uso_tubo_ventilacao` BOOLEAN NULL,
    `fala_linguagem_tubo_ventilacao_observacao` TEXT NOT NULL,
    `fala_linguagem_faz_ou_fez_uso_objeto_oral` BOOLEAN NULL,
    `fala_linguagem_objeto_oral_especificar` TEXT NOT NULL,
    `fala_linguagem_usa_mamadeira` BOOLEAN NULL,
    `fala_linguagem_mamadeira_ha` VARCHAR(191) NULL,
    `fala_linguagem_mamadeira_vezes_ao_dia` INTEGER NULL,
    `fala_linguagem_mamadeira_detalhes` TEXT NULL,
    `fala_linguagem_comunicacao_atual` TEXT NOT NULL,
    `desfralde_diurno_urina_anos` VARCHAR(191) NOT NULL,
    `desfralde_diurno_urina_meses` VARCHAR(191) NOT NULL,
    `desfralde_diurno_urina_utiliza_fralda` BOOLEAN NOT NULL,
    `desfralde_noturno_urina_anos` VARCHAR(191) NOT NULL,
    `desfralde_noturno_urina_meses` VARCHAR(191) NOT NULL,
    `desfralde_noturno_urina_utiliza_fralda` BOOLEAN NOT NULL,
    `desfralde_fezes_anos` VARCHAR(191) NOT NULL,
    `desfralde_fezes_meses` VARCHAR(191) NOT NULL,
    `desfralde_fezes_utiliza_fralda` BOOLEAN NOT NULL,
    `desfralde_se_limpa_sozinho_urinar` BOOLEAN NULL,
    `desfralde_se_limpa_sozinho_defecar` BOOLEAN NULL,
    `desfralde_lava_as_maos_apos_uso_banheiro` BOOLEAN NULL,
    `desfralde_apresenta_alteracao_habito_intestinal` BOOLEAN NULL,
    `desfralde_observacoes` TEXT NOT NULL,
    `sono_dormem_media_horas_noite` VARCHAR(191) NOT NULL,
    `sono_dormem_media_horas_dia` VARCHAR(191) NOT NULL,
    `sono_periodo_sono_dia` VARCHAR(191) NULL,
    `sono_tem_dificuldade_iniciar_sono` BOOLEAN NULL,
    `sono_acorda_de_madrugada` BOOLEAN NULL,
    `sono_dorme_na_propria_cama` BOOLEAN NULL,
    `sono_dorme_no_proprio_quarto` BOOLEAN NULL,
    `sono_apresenta_sono_agitado` BOOLEAN NULL,
    `sono_e_sonambulo` BOOLEAN NULL,
    `sono_observacoes` TEXT NOT NULL,
    `habitos_higiene_toma_banho_lava_corpo_todo` ENUM('SIM', 'NAO', 'COM_AJUDA') NULL,
    `habitos_higiene_seca_corpo_todo` ENUM('SIM', 'NAO', 'COM_AJUDA') NULL,
    `habitos_higiene_retira_todas_pecas_roupa` ENUM('SIM', 'NAO', 'COM_AJUDA') NULL,
    `habitos_higiene_coloca_todas_pecas_roupa` ENUM('SIM', 'NAO', 'COM_AJUDA') NULL,
    `habitos_higiene_poe_calcados_sem_cadarco` ENUM('SIM', 'NAO', 'COM_AJUDA') NULL,
    `habitos_higiene_poe_calcados_com_cadarco` ENUM('SIM', 'NAO', 'COM_AJUDA') NULL,
    `habitos_higiene_escova_os_dentes` ENUM('SIM', 'NAO', 'COM_AJUDA') NULL,
    `habitos_higiene_penteia_o_cabelo` ENUM('SIM', 'NAO', 'COM_AJUDA') NULL,
    `habitos_higiene_observacoes` TEXT NOT NULL,
    `alimentacao_apresenta_queixa_alimentacao` BOOLEAN NULL,
    `alimentacao_se_alimenta_sozinho` BOOLEAN NULL,
    `alimentacao_e_seletivo_quanto_alimentos` BOOLEAN NULL,
    `alimentacao_passa_dia_inteiro_sem_comer` BOOLEAN NULL,
    `alimentacao_apresenta_rituais_para_alimentar` BOOLEAN NULL,
    `alimentacao_esta_abaixo_ou_acima_peso` BOOLEAN NULL,
    `alimentacao_esta_abaixo_ou_acima_peso_descricao` TEXT NOT NULL,
    `alimentacao_tem_historico_anemia` BOOLEAN NULL,
    `alimentacao_tem_historico_anemia_descricao` TEXT NOT NULL,
    `alimentacao_rotina_alimentar_e_problema_familia` BOOLEAN NULL,
    `alimentacao_rotina_alimentar_e_problema_familia_descricao` TEXT NOT NULL,
    `alimentacao_observacoes` TEXT NOT NULL,
    `desenvolvimento_social_possui_amigos_mesma_idade_escola` BOOLEAN NULL,
    `desenvolvimento_social_possui_amigos_mesma_idade_fora_escola` BOOLEAN NULL,
    `desenvolvimento_social_faz_uso_funcional_brinquedos` BOOLEAN NULL,
    `desenvolvimento_social_brinca_proximo_aos_colegas` BOOLEAN NULL,
    `desenvolvimento_social_brinca_conjunta_com_colegas` BOOLEAN NULL,
    `desenvolvimento_social_procura_colegas_espontaneamente` BOOLEAN NULL,
    `desenvolvimento_social_se_verbal_inicia_conversa` BOOLEAN NULL,
    `desenvolvimento_social_se_verbal_responde_perguntas_simples` BOOLEAN NULL,
    `desenvolvimento_social_faz_pedidos_quando_necessario` BOOLEAN NULL,
    `desenvolvimento_social_estabelece_contato_visual_adultos` BOOLEAN NULL,
    `desenvolvimento_social_estabelece_contato_visual_criancas` BOOLEAN NULL,
    `desenvolvimento_social_observacoes` TEXT NOT NULL,
    `desenvolvimento_social_brinca_com_outras_criancas` BOOLEAN NULL,
    `desenvolvimento_social_tipo_brincadeira` TEXT NULL,
    `desenvolvimento_social_mantem_contato_visual` BOOLEAN NULL,
    `desenvolvimento_social_responde_ao_chamar` BOOLEAN NULL,
    `desenvolvimento_social_compartilha_interesses` BOOLEAN NULL,
    `desenvolvimento_social_compreende_sentimentos` BOOLEAN NULL,
    `desenvolvimento_academico_escola` VARCHAR(191) NOT NULL,
    `desenvolvimento_academico_ano` VARCHAR(191) NULL,
    `desenvolvimento_academico_periodo` VARCHAR(191) NOT NULL,
    `desenvolvimento_academico_direcao` VARCHAR(191) NOT NULL,
    `desenvolvimento_academico_coordenacao` VARCHAR(191) NOT NULL,
    `desenvolvimento_academico_professora_principal` VARCHAR(191) NOT NULL,
    `desenvolvimento_academico_professora_assistente` VARCHAR(191) NOT NULL,
    `desenvolvimento_academico_frequenta_escola_regular` BOOLEAN NULL,
    `desenvolvimento_academico_frequenta_escola_especial` BOOLEAN NULL,
    `desenvolvimento_academico_demandas_pedagogicas` BOOLEAN NULL,
    `desenvolvimento_academico_segue_regras_rotina_sala_aula` BOOLEAN NULL,
    `desenvolvimento_academico_necessita_apoio_at` BOOLEAN NULL,
    `desenvolvimento_academico_necessita_adaptacao_materiais` BOOLEAN NULL,
    `desenvolvimento_academico_necessita_adaptacao_curricular` BOOLEAN NULL,
    `desenvolvimento_academico_houve_reprovacao_retencao` BOOLEAN NULL,
    `desenvolvimento_academico_escola_possui_equipe_inclusao` BOOLEAN NULL,
    `desenvolvimento_academico_deficiencia_intelectual` BOOLEAN NULL,
    `desenvolvimento_academico_queixa_comportamental` BOOLEAN NULL,
    `desenvolvimento_academico_adaptacao_escolar` TEXT NOT NULL,
    `desenvolvimento_academico_dificuldades_escolares` TEXT NOT NULL,
    `desenvolvimento_academico_relacionamento_com_colegas` TEXT NOT NULL,
    `desenvolvimento_academico_observacoes` TEXT NOT NULL,
    `estereotipias_rituais_balanca_maos_lado_corpo_ou_frente` BOOLEAN NULL,
    `estereotipias_rituais_balanca_corpo_frente_para_tras` BOOLEAN NULL,
    `estereotipias_rituais_pula_ou_gira_em_torno_de_si` BOOLEAN NULL,
    `estereotipias_rituais_repete_sons_sem_funcao_comunicativa` BOOLEAN NULL,
    `estereotipias_rituais_repete_movimentos_continuos` BOOLEAN NULL,
    `estereotipias_rituais_explora_ambiente_lambendo_tocando` BOOLEAN NULL,
    `estereotipias_rituais_procura_observar_objetos_canto_olho` BOOLEAN NULL,
    `estereotipias_rituais_organiza_objetos_lado_a_lado` BOOLEAN NULL,
    `estereotipias_rituais_realiza_tarefas_sempre_mesma_ordem` BOOLEAN NULL,
    `estereotipias_rituais_apresenta_rituais_diarios` BOOLEAN NULL,
    `estereotipias_rituais_observacoes_topografias` TEXT NOT NULL,
    `problemas_comportamento_auto_lesivos` BOOLEAN NULL,
    `problemas_comportamento_auto_lesivos_quais` TEXT NOT NULL,
    `problemas_comportamento_heteroagressivos` BOOLEAN NULL,
    `problemas_comportamento_heteroagressivos_quais` TEXT NOT NULL,
    `problemas_comportamento_apresenta_destruicao_propriedade` BOOLEAN NULL,
    `problemas_comportamento_destruicao_descrever` TEXT NOT NULL,
    `problemas_comportamento_necessitou_contencao_mecanica` BOOLEAN NULL,
    `problemas_comportamento_observacoes_topografias` TEXT NOT NULL,
    `finalizacao_outras_informacoes_relevantes` TEXT NULL,
    `finalizacao_informacoes_adicionais` TEXT NULL,
    `finalizacao_observacoes_impressoes_terapeuta` TEXT NULL,
    `finalizacao_observacoes_finais` TEXT NULL,
    `finalizacao_expectativas_familia` TEXT NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `anamnese_cliente_id_idx`(`cliente_id`),
    INDEX `anamnese_terapeuta_id_idx`(`terapeuta_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_especialidade_consultada` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anamnese_id` VARCHAR(191) NOT NULL,
    `external_id` VARCHAR(191) NULL,
    `especialidade` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `data` DATE NOT NULL,
    `observacao` TEXT NULL,
    `ativo` BOOLEAN NOT NULL,

    INDEX `anamnese_especialidade_consultada_anamnese_id_fkey`(`anamnese_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_medicamento_em_uso` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anamnese_id` VARCHAR(191) NOT NULL,
    `external_id` VARCHAR(191) NULL,
    `nome` VARCHAR(191) NOT NULL,
    `dosagem` VARCHAR(191) NOT NULL,
    `data_inicio` DATE NOT NULL,
    `motivo` TEXT NOT NULL,

    INDEX `anamnese_medicamento_em_uso_anamnese_id_fkey`(`anamnese_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_exame_previo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anamnese_id` VARCHAR(191) NOT NULL,
    `external_id` VARCHAR(191) NULL,
    `nome` VARCHAR(191) NOT NULL,
    `data` DATE NOT NULL,
    `resultado` TEXT NOT NULL,

    INDEX `anamnese_exame_previo_anamnese_id_fkey`(`anamnese_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_exame_arquivo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `exame_previo_id` INTEGER NOT NULL,
    `external_id` VARCHAR(191) NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `tamanho` INTEGER NOT NULL,
    `url` TEXT NULL,
    `file` JSON NULL,

    INDEX `anamnese_exame_arquivo_exame_previo_id_fkey`(`exame_previo_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_terapia_previa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anamnese_id` VARCHAR(191) NOT NULL,
    `external_id` VARCHAR(191) NULL,
    `profissional` VARCHAR(191) NOT NULL,
    `especialidade_abordagem` VARCHAR(191) NOT NULL,
    `tempo_intervencao` VARCHAR(191) NOT NULL,
    `observacao` TEXT NULL,
    `ativo` BOOLEAN NOT NULL,

    INDEX `anamnese_terapia_previa_anamnese_id_fkey`(`anamnese_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_historico_familiar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anamnese_id` VARCHAR(191) NOT NULL,
    `external_id` VARCHAR(191) NULL,
    `condicao_diagnostico` TEXT NULL,
    `condicao` TEXT NULL,
    `parentesco` VARCHAR(191) NOT NULL,
    `observacao` TEXT NULL,

    INDEX `anamnese_historico_familiar_anamnese_id_fkey`(`anamnese_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_atividade_rotina` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anamnese_id` VARCHAR(191) NOT NULL,
    `external_id` VARCHAR(191) NULL,
    `atividade` VARCHAR(191) NOT NULL,
    `horario` VARCHAR(191) NOT NULL,
    `responsavel` VARCHAR(191) NULL,
    `frequencia` VARCHAR(191) NULL,
    `observacao` TEXT NULL,

    INDEX `anamnese_atividade_rotina_anamnese_id_fkey`(`anamnese_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anamnese_cuidador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anamnese_id` VARCHAR(191) NOT NULL,
    `cuidador_id` INTEGER NOT NULL,

    INDEX `anamnese_cuidador_cuidador_id_fkey`(`cuidador_id`),
    UNIQUE INDEX `anamnese_cuidador_anamnese_id_cuidador_id_key`(`anamnese_id`, `cuidador_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `anamnese` ADD CONSTRAINT `anamnese_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese` ADD CONSTRAINT `anamnese_terapeuta_id_fkey` FOREIGN KEY (`terapeuta_id`) REFERENCES `terapeuta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_especialidade_consultada` ADD CONSTRAINT `anamnese_especialidade_consultada_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_medicamento_em_uso` ADD CONSTRAINT `anamnese_medicamento_em_uso_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_exame_previo` ADD CONSTRAINT `anamnese_exame_previo_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_exame_arquivo` ADD CONSTRAINT `anamnese_exame_arquivo_exame_previo_id_fkey` FOREIGN KEY (`exame_previo_id`) REFERENCES `anamnese_exame_previo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_terapia_previa` ADD CONSTRAINT `anamnese_terapia_previa_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_historico_familiar` ADD CONSTRAINT `anamnese_historico_familiar_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_atividade_rotina` ADD CONSTRAINT `anamnese_atividade_rotina_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_cuidador` ADD CONSTRAINT `anamnese_cuidador_anamnese_id_fkey` FOREIGN KEY (`anamnese_id`) REFERENCES `anamnese`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anamnese_cuidador` ADD CONSTRAINT `anamnese_cuidador_cuidador_id_fkey` FOREIGN KEY (`cuidador_id`) REFERENCES `cuidador`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
