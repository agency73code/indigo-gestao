import type { Prisma, AjudaStatus } from '@prisma/client';
import { prisma } from '../../config/database.js';
import type { AnamnesePayload, marcoDesenvolvimentoSchema } from '../../schemas/anamnese.schema.js';
import type z from 'zod';

type SimNao = 'sim' | 'nao' | null | undefined;
type SimNaoComAjuda = 'sim' | 'nao' | 'com_ajuda' | null | undefined;
type MarcoDesenvolvimentoPayload = z.infer<typeof marcoDesenvolvimentoSchema>;

function mapSimNao(value: SimNao): boolean | null {
    if (value === 'sim') return true;
    if (value === 'nao') return false;
    return null;
}

function mapAjudaStatus(value: SimNaoComAjuda): AjudaStatus | null {
    if (value === 'sim') return 'SIM';
    if (value === 'nao') return 'NAO';
    if (value === 'com_ajuda') return 'COM_AJUDA';
    return null;
}

function mapDate(value?: string | null) {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function mapMarco(prefix: string, marco?: MarcoDesenvolvimentoPayload): Partial<Prisma.AnamneseCreateInput> {
    return {
        [`${prefix}_meses`]: marco?.meses ?? null,
        [`${prefix}_status`]: marco?.status ?? null,
        [`${prefix}_nao_realiza`]: marco?.naoRealiza ?? null,
        [`${prefix}_nao_soube_informar`]: marco?.naoSoubeInformar ?? null,
        [`${prefix}_nao`]: marco?.nao ?? null,
    } as Partial<Prisma.AnamneseCreateInput>;
}

export async function create(payload: AnamnesePayload) {
    const cabecalho = payload.cabecalho ?? {};
    const queixa = payload.queixaDiagnostico ?? {};
    const contexto = payload.contextoFamiliarRotina ?? {};
    const desenvolvimento = payload.desenvolvimentoInicial ?? {};
    const neuro = desenvolvimento.neuropsicomotor ?? {};
    const fala = desenvolvimento.falaLinguagem ?? {};
    const gestacao = desenvolvimento.gestacaoParto ?? {};
    const atividades = payload.atividadesVidaDiaria ?? {};
    const desfralde = atividades.desfralde ?? {};
    const sono = atividades.sono ?? {};
    const higiene = atividades.habitosHigiene ?? {};
    const alimentacao = atividades.alimentacao ?? {};
    const social =
        payload.socialAcademico?.desenvolvimentoSocial ??
        payload.socialAcademico?.interacaoSocial ??
        {};
    const academico =
        payload.socialAcademico?.desenvolvimentoAcademico ??
        payload.socialAcademico?.vidaEscolar ??
        {};
    const comportamento = payload.comportamento ?? {};
    const estereotipias = comportamento.estereotipiasRituais ?? {};
    const problemas = comportamento.problemasComportamento ?? {};
    const finalizacao = payload.finalizacao ?? {};

    const especialidadesConsultadas = (queixa.especialidadesConsultadas ?? []).map((esp) => ({
        external_id: esp.id ?? null,
        especialidade: esp.especialidade ?? '',
        nome: esp.nome ?? '',
        data: mapDate(esp.data) ?? new Date(),
        observacao: esp.observacao ?? null,
        ativo: Boolean(esp.ativo),
    }));

    const medicamentosEmUso = (queixa.medicamentosEmUso ?? []).map((med) => ({
        external_id: med.id ?? null,
        nome: med.nome ?? '',
        dosagem: med.dosagem ?? '',
        data_inicio: mapDate(med.dataInicio) ?? new Date(),
        motivo: med.motivo ?? '',
    }));

    const examesPrevios = (queixa.examesPrevios ?? []).map((exame) => ({
        external_id: exame.id ?? null,
        nome: exame.nome ?? '',
        data: mapDate(exame.data) ?? new Date(),
        resultado: exame.resultado ?? '',
        arquivos: {
            create: (exame.arquivos ?? []).map((arquivo) => ({
                external_id: arquivo.id ?? null,
                nome: arquivo.nome ?? '',
                tipo: arquivo.tipo ?? '',
                tamanho: arquivo.tamanho ?? 0,
                url: arquivo.url ?? null,
                file: arquivo.file ?? null,
            })),
        },
    }));

    const terapiasPrevias = (queixa.terapiasPrevias ?? []).map((terapia) => ({
        external_id: terapia.id ?? null,
        profissional: terapia.profissional ?? '',
        especialidade_abordagem: terapia.especialidadeAbordagem ?? '',
        tempo_intervencao: terapia.tempoIntervencao ?? '',
        observacao: terapia.observacao ?? null,
        ativo: Boolean(terapia.ativo),
    }));

    const historicosFamiliares = (
        contexto.historicosFamiliares ?? contexto.historicoFamiliar ?? []
    ).map((hist) => ({
        external_id: hist.id ?? null,
        condicao_diagnostico: hist.condicaoDiagnostico ?? hist.condicao ?? null,
        condicao: hist.condicao ?? null,
        parentesco: hist.parentesco ?? '',
        observacao: hist.observacao ?? null,
    }));

    const atividadesRotina = (contexto.atividadesRotina ?? contexto.rotinaDiaria ?? []).map(
        (rotina) => ({
            external_id: rotina.id ?? null,
            atividade: rotina.atividade ?? '',
            horario: rotina.horario ?? '',
            responsavel: rotina.responsavel ?? null,
            frequencia: rotina.frequencia ?? null,
            observacao: rotina.observacao ?? null,
        }),
    );

    const cuidadoresIds = Array.from(
        new Set(
            (cabecalho.cuidadores ?? [])
                .map((cuidador) => Number(cuidador.id))
                .filter((id) => Number.isInteger(id) && id > 0),
        ),
    );

    const data = {
        cliente_id: cabecalho.clienteId ?? '',
        terapeuta_id: cabecalho.profissionalId ?? '',
        data_entrevista: mapDate(cabecalho.dataEntrevista) ?? new Date(),
        cliente_nome: cabecalho.clienteNome ?? '',
        cliente_avatar_url: cabecalho.clienteAvatarUrl ?? null,
        data_nascimento: mapDate(cabecalho.dataNascimento) ?? new Date(),
        idade: cabecalho.idade ?? '',
        informante: cabecalho.informante ?? '',
        parentesco: cabecalho.parentesco ?? '',
        parentesco_descricao: cabecalho.parentescoDescricao ?? null,
        quem_indicou: cabecalho.quemIndicou ?? '',
        profissional_nome: cabecalho.profissionalNome ?? '',
        escola_cliente: cabecalho.escolaCliente ?? null,
        status: payload.status ?? null,
        queixa_principal: queixa.queixaPrincipal ?? '',
        diagnostico_previo: queixa.diagnosticoPrevio ?? '',
        suspeita_condicao_associada: queixa.suspeitaCondicaoAssociada ?? '',
        cuidadores_principais: contexto.cuidadoresPrincipais ?? null,
        tempo_tela: contexto.tempoTela ?? null,
        gestacao_parto_tipo_parto: gestacao.tipoParto ?? null,
        gestacao_parto_semanas: gestacao.semanas ?? null,
        gestacao_parto_apgar_1min: gestacao.apgar1min ?? null,
        gestacao_parto_apgar_5min: gestacao.apgar5min ?? null,
        gestacao_parto_intercorrencias: gestacao.intercorrencias ?? '',
        ...mapMarco('neuropsicomotor_sustentou_cabeca', neuro.sustentouCabeca),
        ...mapMarco('neuropsicomotor_rolou', neuro.rolou),
        ...mapMarco('neuropsicomotor_sentou', neuro.sentou),
        ...mapMarco('neuropsicomotor_engatinhou', neuro.engatinhou),
        ...mapMarco('neuropsicomotor_andou_com_apoio', neuro.andouComApoio),
        ...mapMarco('neuropsicomotor_andou_sem_apoio', neuro.andouSemApoio),
        ...mapMarco('neuropsicomotor_correu', neuro.correu),
        ...mapMarco('neuropsicomotor_andou_de_motoca', neuro.andouDeMotoca),
        ...mapMarco('neuropsicomotor_andou_de_bicicleta', neuro.andouDeBicicleta),
        ...mapMarco(
            'neuropsicomotor_subiu_escadas_sozinho',
            neuro.subiuEscadasSozinho,
        ),
        neuropsicomotor_motricidade_fina: neuro.motricidadeFina ?? '',
        ...mapMarco('fala_linguagem_balbuciou', fala.balbuciou),
        ...mapMarco('fala_linguagem_primeiras_palavras', fala.primeirasPalavras),
        ...mapMarco('fala_linguagem_primeiras_frases', fala.primeirasFrases),
        ...mapMarco(
            'fala_linguagem_apontou_para_fazer_pedidos',
            fala.apontouParaFazerPedidos,
        ),
        fala_linguagem_faz_uso_de_gestos: mapSimNao(fala.fazUsoDeGestos),
        fala_linguagem_faz_uso_de_gestos_quais: fala.fazUsoDeGestosQuais ?? '',
        fala_linguagem_audicao: fala.audicao ?? null,
        fala_linguagem_teve_otite_de_repeticao: mapSimNao(fala.teveOtiteDeRepeticao),
        fala_linguagem_otite_vezes: fala.otiteVezes ?? null,
        fala_linguagem_otite_periodo_meses: fala.otitePeriodoMeses ?? null,
        fala_linguagem_otite_frequencia: fala.otiteFrequencia ?? null,
        fala_linguagem_otite_detalhes: fala.otiteDetalhes ?? null,
        fala_linguagem_faz_ou_fez_uso_tubo_ventilacao: mapSimNao(
            fala.fazOuFezUsoTuboVentilacao,
        ),
        fala_linguagem_tubo_ventilacao_observacao: fala.tuboVentilacaoObservacao ?? '',
        fala_linguagem_faz_ou_fez_uso_objeto_oral: mapSimNao(
            fala.fazOuFezUsoObjetoOral,
        ),
        fala_linguagem_objeto_oral_especificar: fala.objetoOralEspecificar ?? '',
        fala_linguagem_usa_mamadeira: mapSimNao(fala.usaMamadeira),
        fala_linguagem_mamadeira_ha: fala.mamadeiraHa ?? null,
        fala_linguagem_mamadeira_vezes_ao_dia: fala.mamadeiraVezesAoDia ?? null,
        fala_linguagem_mamadeira_detalhes: fala.mamadeiraDetalhes ?? null,
        fala_linguagem_comunicacao_atual: fala.comunicacaoAtual ?? '',
        desfralde_diurno_urina_anos: desfralde.desfraldeDiurnoUrina?.anos ?? '',
        desfralde_diurno_urina_meses: desfralde.desfraldeDiurnoUrina?.meses ?? '',
        desfralde_diurno_urina_utiliza_fralda:
            desfralde.desfraldeDiurnoUrina?.utilizaFralda ?? false,
        desfralde_noturno_urina_anos: desfralde.desfraldeNoturnoUrina?.anos ?? '',
        desfralde_noturno_urina_meses: desfralde.desfraldeNoturnoUrina?.meses ?? '',
        desfralde_noturno_urina_utiliza_fralda:
            desfralde.desfraldeNoturnoUrina?.utilizaFralda ?? false,
        desfralde_fezes_anos: desfralde.desfraldeFezes?.anos ?? '',
        desfralde_fezes_meses: desfralde.desfraldeFezes?.meses ?? '',
        desfralde_fezes_utiliza_fralda: desfralde.desfraldeFezes?.utilizaFralda ?? false,
        desfralde_se_limpa_sozinho_urinar: mapSimNao(desfralde.seLimpaSozinhoUrinar),
        desfralde_se_limpa_sozinho_defecar: mapSimNao(desfralde.seLimpaSozinhoDefecar),
        desfralde_lava_as_maos_apos_uso_banheiro: mapSimNao(
            desfralde.lavaAsMaosAposUsoBanheiro,
        ),
        desfralde_apresenta_alteracao_habito_intestinal: mapSimNao(
            desfralde.apresentaAlteracaoHabitoIntestinal,
        ),
        desfralde_observacoes: desfralde.observacoes ?? '',
        sono_dormem_media_horas_noite: sono.dormemMediaHorasNoite ?? '',
        sono_dormem_media_horas_dia: sono.dormemMediaHorasDia ?? '',
        sono_periodo_sono_dia: sono.periodoSonoDia ?? null,
        sono_tem_dificuldade_iniciar_sono: mapSimNao(sono.temDificuldadeIniciarSono),
        sono_acorda_de_madrugada: mapSimNao(sono.acordaDeMadrugada),
        sono_dorme_na_propria_cama: mapSimNao(sono.dormeNaPropriaCama),
        sono_dorme_no_proprio_quarto: mapSimNao(sono.dormeNoProprioQuarto),
        sono_apresenta_sono_agitado: mapSimNao(sono.apresentaSonoAgitado),
        sono_e_sonambulo: mapSimNao(sono.eSonambulo),
        sono_observacoes: sono.observacoes ?? '',
        habitos_higiene_toma_banho_lava_corpo_todo: mapAjudaStatus(
            higiene.tomaBanhoLavaCorpoTodo,
        ),
        habitos_higiene_seca_corpo_todo: mapAjudaStatus(higiene.secaCorpoTodo),
        habitos_higiene_retira_todas_pecas_roupa: mapAjudaStatus(
            higiene.retiraTodasPecasRoupa,
        ),
        habitos_higiene_coloca_todas_pecas_roupa: mapAjudaStatus(
            higiene.colocaTodasPecasRoupa,
        ),
        habitos_higiene_poe_calcados_sem_cadarco: mapAjudaStatus(
            higiene.poeCalcadosSemCadarco,
        ),
        habitos_higiene_poe_calcados_com_cadarco: mapAjudaStatus(
            higiene.poeCalcadosComCadarco,
        ),
        habitos_higiene_escova_os_dentes: mapAjudaStatus(higiene.escovaOsDentes),
        habitos_higiene_penteia_o_cabelo: mapAjudaStatus(higiene.penteiaOCabelo),
        habitos_higiene_observacoes: higiene.observacoes ?? '',
        alimentacao_apresenta_queixa_alimentacao: mapSimNao(
            alimentacao.apresentaQueixaAlimentacao,
        ),
        alimentacao_se_alimenta_sozinho: mapSimNao(alimentacao.seAlimentaSozinho),
        alimentacao_e_seletivo_quanto_alimentos: mapSimNao(
            alimentacao.eSeletivoQuantoAlimentos,
        ),
        alimentacao_passa_dia_inteiro_sem_comer: mapSimNao(
            alimentacao.passaDiaInteiroSemComer,
        ),
        alimentacao_apresenta_rituais_para_alimentar: mapSimNao(
            alimentacao.apresentaRituaisParaAlimentar,
        ),
        alimentacao_esta_abaixo_ou_acima_peso: mapSimNao(
            alimentacao.estaAbaixoOuAcimaPeso,
        ),
        alimentacao_esta_abaixo_ou_acima_peso_descricao:
            alimentacao.estaAbaixoOuAcimaPesoDescricao ?? '',
        alimentacao_tem_historico_anemia: mapSimNao(alimentacao.temHistoricoAnemia),
        alimentacao_tem_historico_anemia_descricao:
            alimentacao.temHistoricoAnemiaDescricao ?? '',
        alimentacao_rotina_alimentar_e_problema_familia: mapSimNao(
            alimentacao.rotinaAlimentarEProblemaFamilia,
        ),
        alimentacao_rotina_alimentar_e_problema_familia_descricao:
            alimentacao.rotinaAlimentarEProblemaFamiliaDescricao ?? '',
        alimentacao_observacoes: alimentacao.observacoes ?? '',
        desenvolvimento_social_possui_amigos_mesma_idade_escola: mapSimNao(
            social.possuiAmigosMesmaIdadeEscola,
        ),
        desenvolvimento_social_possui_amigos_mesma_idade_fora_escola: mapSimNao(
            social.possuiAmigosMesmaIdadeForaEscola,
        ),
        desenvolvimento_social_faz_uso_funcional_brinquedos: mapSimNao(
            social.fazUsoFuncionalBrinquedos,
        ),
        desenvolvimento_social_brinca_proximo_aos_colegas: mapSimNao(
            social.brincaProximoAosColegas,
        ),
        desenvolvimento_social_brinca_conjunta_com_colegas: mapSimNao(
            social.brincaConjuntaComColegas,
        ),
        desenvolvimento_social_procura_colegas_espontaneamente: mapSimNao(
            social.procuraColegasEspontaneamente,
        ),
        desenvolvimento_social_se_verbal_inicia_conversa: mapSimNao(
            social.seVerbalIniciaConversa,
        ),
        desenvolvimento_social_se_verbal_responde_perguntas_simples: mapSimNao(
            social.seVerbalRespondePerguntasSimples,
        ),
        desenvolvimento_social_faz_pedidos_quando_necessario: mapSimNao(
            social.fazPedidosQuandoNecessario,
        ),
        desenvolvimento_social_estabelece_contato_visual_adultos: mapSimNao(
            social.estabeleceContatoVisualAdultos,
        ),
        desenvolvimento_social_estabelece_contato_visual_criancas: mapSimNao(
            social.estabeleceContatoVisualCriancas,
        ),
        desenvolvimento_social_observacoes: social.observacoes ?? '',
        desenvolvimento_social_brinca_com_outras_criancas: mapSimNao(
            social.brincaComOutrasCriancas,
        ),
        desenvolvimento_social_tipo_brincadeira: social.tipoBrincadeira ?? null,
        desenvolvimento_social_mantem_contato_visual: mapSimNao(social.mantemContatoVisual),
        desenvolvimento_social_responde_ao_chamar: mapSimNao(social.respondeAoChamar),
        desenvolvimento_social_compartilha_interesses: mapSimNao(
            social.compartilhaInteresses,
        ),
        desenvolvimento_social_compreende_sentimentos: mapSimNao(
            social.compreendeSentimentos,
        ),
        desenvolvimento_academico_escola: academico.escola ?? '',
        desenvolvimento_academico_ano:
            academico.ano !== undefined && academico.ano !== null
                ? String(academico.ano)
                : null,
        desenvolvimento_academico_periodo: academico.periodo ?? '',
        desenvolvimento_academico_direcao: academico.direcao ?? '',
        desenvolvimento_academico_coordenacao: academico.coordenacao ?? '',
        desenvolvimento_academico_professora_principal: academico.professoraPrincipal ?? '',
        desenvolvimento_academico_professora_assistente:
            academico.professoraAssistente ?? '',
        desenvolvimento_academico_frequenta_escola_regular: mapSimNao(
            academico.frequentaEscolaRegular,
        ),
        desenvolvimento_academico_frequenta_escola_especial: mapSimNao(
            academico.frequentaEscolaEspecial,
        ),
        desenvolvimento_academico_demandas_pedagogicas: mapSimNao(
            academico.acompanhaTurmaDemandasPedagogicas,
        ),
        desenvolvimento_academico_segue_regras_rotina_sala_aula: mapSimNao(
            academico.segueRegrasRotinaSalaAula,
        ),
        desenvolvimento_academico_necessita_apoio_at: mapSimNao(
            academico.necessitaApoioAT,
        ),
        desenvolvimento_academico_necessita_adaptacao_materiais: mapSimNao(
            academico.necessitaAdaptacaoMateriais,
        ),
        desenvolvimento_academico_necessita_adaptacao_curricular: mapSimNao(
            academico.necessitaAdaptacaoCurricular,
        ),
        desenvolvimento_academico_houve_reprovacao_retencao: mapSimNao(
            academico.houveReprovacaoRetencao,
        ),
        desenvolvimento_academico_escola_possui_equipe_inclusao: mapSimNao(
            academico.escolaPossuiEquipeInclusao,
        ),
        desenvolvimento_academico_deficiencia_intelectual: mapSimNao(
            academico.haIndicativoDeficienciaIntelectual,
        ),
        desenvolvimento_academico_queixa_comportamental: mapSimNao(
            academico.escolaApresentaQueixaComportamental,
        ),
        desenvolvimento_academico_adaptacao_escolar: academico.adaptacaoEscolar ?? '',
        desenvolvimento_academico_dificuldades_escolares:
            academico.dificuldadesEscolares ?? '',
        desenvolvimento_academico_relacionamento_com_colegas:
            academico.relacionamentoComColegas ?? '',
        desenvolvimento_academico_observacoes: academico.observacoes ?? '',
        estereotipias_rituais_balanca_maos_lado_corpo_ou_frente: mapSimNao(
            estereotipias.balancaMaosLadoCorpoOuFrente,
        ),
        estereotipias_rituais_balanca_corpo_frente_para_tras: mapSimNao(
            estereotipias.balancaCorpoFrenteParaTras,
        ),
        estereotipias_rituais_pula_ou_gira_em_torno_de_si: mapSimNao(
            estereotipias.pulaOuGiraEmTornoDeSi,
        ),
        estereotipias_rituais_repete_sons_sem_funcao_comunicativa: mapSimNao(
            estereotipias.repeteSonsSemFuncaoComunicativa,
        ),
        estereotipias_rituais_repete_movimentos_continuos: mapSimNao(
            estereotipias.repeteMovimentosContinuos,
        ),
        estereotipias_rituais_explora_ambiente_lambendo_tocando: mapSimNao(
            estereotipias.exploraAmbienteLambendoTocando,
        ),
        estereotipias_rituais_procura_observar_objetos_canto_olho: mapSimNao(
            estereotipias.procuraObservarObjetosCantoOlho,
        ),
        estereotipias_rituais_organiza_objetos_lado_a_lado: mapSimNao(
            estereotipias.organizaObjetosLadoALado,
        ),
        estereotipias_rituais_realiza_tarefas_sempre_mesma_ordem: mapSimNao(
            estereotipias.realizaTarefasSempreMesmaOrdem,
        ),
        estereotipias_rituais_apresenta_rituais_diarios: mapSimNao(
            estereotipias.apresentaRituaisDiarios,
        ),
        estereotipias_rituais_observacoes_topografias:
            estereotipias.observacoesTopografias ?? '',
        problemas_comportamento_auto_lesivos: mapSimNao(
            problemas.apresentaComportamentosAutoLesivos,
        ),
        problemas_comportamento_auto_lesivos_quais: problemas.autoLesivosQuais ?? '',
        problemas_comportamento_heteroagressivos: mapSimNao(
            problemas.apresentaComportamentosHeteroagressivos,
        ),
        problemas_comportamento_heteroagressivos_quais: problemas.heteroagressivosQuais ?? '',
        problemas_comportamento_apresenta_destruicao_propriedade: mapSimNao(
            problemas.apresentaDestruicaoPropriedade,
        ),
        problemas_comportamento_destruicao_descrever: problemas.destruicaoDescrever ?? '',
        problemas_comportamento_necessitou_contencao_mecanica: mapSimNao(
            problemas.necessitouContencaoMecanica,
        ),
        problemas_comportamento_observacoes_topografias:
            problemas.observacoesTopografias ?? '',
        finalizacao_outras_informacoes_relevantes:
            finalizacao.outrasInformacoesRelevantes ?? null,
        finalizacao_informacoes_adicionais: finalizacao.informacoesAdicionais ?? null,
        finalizacao_observacoes_impressoes_terapeuta:
            finalizacao.observacoesImpressoesTerapeuta ?? null,
        finalizacao_observacoes_finais: finalizacao.observacoesFinais ?? null,
        finalizacao_expectativas_familia: finalizacao.expectativasFamilia ?? '',
        ...(especialidadesConsultadas.length > 0 && {
            especialidadesConsultadas: { create: especialidadesConsultadas },
        }),
        ...(medicamentosEmUso.length > 0 && {
            medicamentosEmUso: { create: medicamentosEmUso },
        }),
        ...(examesPrevios.length > 0 && {
            examesPrevios: { create: examesPrevios },
        }),
        ...(terapiasPrevias.length > 0 && {
            terapiasPrevias: { create: terapiasPrevias },
        }),
        ...(historicosFamiliares.length > 0 && {
            historicosFamiliares: { create: historicosFamiliares },
        }),
        ...(atividadesRotina.length > 0 && {
            atividadesRotina: { create: atividadesRotina },
        }),
        ...(cuidadoresIds.length > 0 && {
            cuidadores: {
                create: cuidadoresIds.map((id) => ({
                    cuidador: { connect: { id } },
                })),
            },
        }),
    };

    return prisma.anamnese.create({
        data: data as Prisma.AnamneseUncheckedCreateInput,
    });
}