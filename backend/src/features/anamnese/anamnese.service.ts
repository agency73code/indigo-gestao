import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import type { AnamnesePayload } from '../../schemas/anamnese.schema.js';
import { ACCESS_LEVELS } from '../../utils/accessLevels.js';
import { getVisibilityScope } from '../../utils/visibilityFilter.js';
import type { AnamneseListFilters, AnamneseListItem, AnamneseListResult } from './anamnese.types.js';
import { AppError } from '../../errors/AppError.js';
import { toDateOnly } from '../../utils/toDateOnly.js';
import { calculateAge } from '../../utils/calculateAge.js';

type SimNao = 'sim' | 'nao' | null | undefined;

const MANAGER_LEVEL = ACCESS_LEVELS['gerente'] ?? 5;

function mapSimNao(value: SimNao): boolean | null {
    if (value === 'sim') return true;
    if (value === 'nao') return false;
    return null;
}

function mapMarco(marco?: {
    meses?: string | null | undefined;
    naoRealiza?: boolean | null | undefined;
    naoSoubeInformar?: boolean | null | undefined;
}) {
    return {
        months: marco?.meses ?? null,
        notPerform: marco?.naoRealiza ?? false,
        didntKnow: marco?.naoSoubeInformar ?? false,
    }
}

export async function create(payload: AnamnesePayload) {
    const header = payload.cabecalho;
    const complaintDiagnosis = payload.queixaDiagnostico;
    const familyContextRoutine = payload.contextoFamiliarRotina;
    const initialDevelopment = payload.desenvolvimentoInicial;
    const daily = payload.atividadesVidaDiaria;
    const socialAcademic = payload.socialAcademico;
    const behavior = payload.comportamento;
    const finishing = payload.finalizacao;

    // neuropsicomotor
    const headHeld = mapMarco(initialDevelopment.neuropsicomotor.sustentouCabeca);
    const rolled = mapMarco(initialDevelopment.neuropsicomotor.rolou);
    const sat = mapMarco(initialDevelopment.neuropsicomotor.sentou);
    const crawled = mapMarco(initialDevelopment.neuropsicomotor.engatinhou);
    const walkedWithSupport = mapMarco(initialDevelopment.neuropsicomotor.andouComApoio);
    const walkedWithoutSupport = mapMarco(initialDevelopment.neuropsicomotor.andouSemApoio);
    const ran = mapMarco(initialDevelopment.neuropsicomotor.correu);
    const scooter = mapMarco(initialDevelopment.neuropsicomotor.andouDeMotoca);
    const bicycle = mapMarco(initialDevelopment.neuropsicomotor.andouDeBicicleta);
    const stairs = mapMarco(initialDevelopment.neuropsicomotor.subiuEscadasSozinho);

    // linguagem
    const babbled = mapMarco(initialDevelopment.falaLinguagem.balbuciou);
    const firstWords = mapMarco(initialDevelopment.falaLinguagem.primeirasPalavras);
    const firstSentences = mapMarco(initialDevelopment.falaLinguagem.primeirasFrases);
    const pointing = mapMarco(initialDevelopment.falaLinguagem.apontouParaFazerPedidos);

    const existingAnamnesesCount = await prisma.anamnese.count({
        where: {
            cliente_id: header.clienteId
        }
    })

    if (existingAnamnesesCount > 0) {
        throw new AppError(
            'ANAMNESE_ALREADY_EXISTS',
            'Já existe uma anamnese cadastrada para este cliente com este terapeuta.'
        );
    }

    return prisma.anamnese.create({
        data: {
            cliente_id: header.clienteId,
            terapeuta_id: header.profissionalId,

            // cabeçalho
            data_entrevista: new Date(header.dataEntrevista),
            informante: header.informante,
            parentesco: header.parentesco,
            parentesco_descricao: header.parentescoDescricao ?? null,
            quem_indicou: header.quemIndicou ?? null,

            queixa_diagnostico: {
                create: {
                    queixa_principal: complaintDiagnosis.queixaPrincipal,
                    diagnostico_previo: complaintDiagnosis.diagnosticoPrevio ?? null,
                    suspeita_condicao_associada: complaintDiagnosis.suspeitaCondicaoAssociada ?? null,

                    // ESPECIALIDADES CONSULTADAS (array)
                    ...(complaintDiagnosis.especialidadesConsultadas &&
                        complaintDiagnosis.especialidadesConsultadas.length > 0 && {
                            especialidades_consultada: {
                                create: complaintDiagnosis.especialidadesConsultadas.map((e) => ({
                                    especialidade: e.especialidade ?? null,
                                    nome: e.nome ?? null,
                                    data: e.data ?? null,
                                    observacao: e.observacao ?? null,
                                    ativo: e.ativo ?? null,
                                })),
                            },
                        }
                    ),

                    // MEDICAMENTOS EM USO (array)
                    ...(complaintDiagnosis.medicamentosEmUso &&
                        complaintDiagnosis.medicamentosEmUso.length > 0 && {
                            medicamentos_em_uso: {
                                create: complaintDiagnosis.medicamentosEmUso.map((m) => ({
                                    nome: m.nome ?? null,
                                    dosagem: m.dosagem ?? null,
                                    data_inicio: m.dataInicio ?? null,
                                    motivo: m.motivo ?? null,
                                })),
                            },
                        }
                    ),

                    // EXAMES PRÉVIOS (array + arquivos)
                    ...(complaintDiagnosis.examesPrevios &&
                        complaintDiagnosis.examesPrevios.length > 0 && {
                            exames_previos: {
                                create: complaintDiagnosis.examesPrevios.map((exame) => ({
                                    nome: exame.nome ?? null,
                                    data: exame.data ?? null,
                                    resultado: exame.resultado ?? null,
                                    
                                    ...(exame.arquivos &&
                                        exame.arquivos.length > 0 && {
                                            arquivos: {
                                                create: exame.arquivos.map((arq) => ({
                                                    nome: arq.nome ?? null,
                                                    tipo: arq.tipo ?? null,
                                                    tamanho: arq.tamanho ?? null,
                                                    caminho: arq.caminho ?? null,
                                                })),
                                            },
                                        }
                                    ),
                                })),
                            },
                        }
                    ),

                    // TERAPIAS PRÉVIAS (array)
                    ...(complaintDiagnosis.terapiasPrevias &&
                        complaintDiagnosis.terapiasPrevias.length > 0 && {
                            terapias_previas: {
                                create: complaintDiagnosis.terapiasPrevias.map((t) => ({
                                    profissional: t.profissional ?? null,
                                    especialidade_abordagem: t.especialidadeAbordagem ?? null,
                                    tempo_intervencao: t.tempoIntervencao ?? null,
                                    observacao: t.observacao ?? null,
                                    ativo: t.ativo ?? null,
                                })),
                            },
                        }
                    ),
                },
            },

            contexto_familiar_rotina: {
                create: {
                    ...(familyContextRoutine.historicosFamiliares &&
                        familyContextRoutine.historicosFamiliares.length > 0 && {
                            historicos_familiares: {
                                create: familyContextRoutine.historicosFamiliares.map((h) => ({
                                    condicao_diagnostico: h.condicaoDiagnostico ?? null,
                                    parentesco: h.parentesco ?? null,
                                    observacao: h.observacao ?? null,
                                })),
                            },
                        }
                    ),

                    ...(familyContextRoutine.atividadesRotina &&
                        familyContextRoutine.atividadesRotina.length > 0 && {
                            atividades_rotina: {
                                create: familyContextRoutine.atividadesRotina.map((a) => ({
                                    atividade: a.atividade ?? null,
                                    horario: a.horario ?? null,
                                    responsavel: a.responsavel ?? null,
                                    frequencia: a.frequencia ?? null,
                                    observacao: a.observacao ?? null,
                                })),
                            },
                        }
                    ),
                },
            },

            desenvolvimento_inicial: {
                create: {
                    // gestação / parto
                    tipo_parto: initialDevelopment.gestacaoParto.tipoParto,
                    semanas: initialDevelopment.gestacaoParto.semanas,
                    apgar_1_min: initialDevelopment.gestacaoParto.apgar1min,
                    apgar_5_min: initialDevelopment.gestacaoParto.apgar5min,
                    intercorrencias: initialDevelopment.gestacaoParto.intercorrencias ?? null,
    
                    // neuropsicomotor
                    sustentou_cabeca_meses: headHeld.months,
                    sustentou_cabeca_nao_realiza: headHeld.notPerform,
                    sustentou_cabeca_nao_soube_informar: headHeld.didntKnow,
    
                    rolou_meses: rolled.months,
                    rolou_nao_realiza: rolled.notPerform,
                    rolou_nao_soube_informar: rolled.didntKnow,
    
                    sentou_meses: sat.months,
                    sentou_nao_realiza: sat.notPerform,
                    sentou_nao_soube_informar: sat.didntKnow,

                    engatinhou_meses: crawled.months,
                    engatinhou_nao_realiza: crawled.notPerform,
                    engatinhou_nao_soube_informar: crawled.didntKnow,

                    andou_com_apoio_meses: walkedWithSupport.months,
                    andou_com_apoio_nao_realiza: walkedWithSupport.notPerform,
                    andou_com_apoio_nao_soube_informar: walkedWithSupport.didntKnow,

                    andou_sem_apoio_meses: walkedWithoutSupport.months,
                    andou_sem_apoio_nao_realiza: walkedWithoutSupport.notPerform,
                    andou_sem_apoio_nao_soube_informar: walkedWithoutSupport.didntKnow,

                    correu_meses: ran.months,
                    correu_nao_realiza: ran.notPerform,
                    correu_nao_soube_informar: ran.didntKnow,

                    andou_de_motoca_meses: scooter.months,
                    andou_de_motoca_nao_realiza: scooter.notPerform,
                    andou_de_motoca_nao_soube_informar: scooter.didntKnow,

                    andou_de_bicicleta_meses: bicycle.months,
                    andou_de_bicicleta_nao_realiza: bicycle.notPerform,
                    andou_de_bicicleta_nao_soube_informar: bicycle.didntKnow,

                    subiu_escadas_sozinho_meses: stairs.months,
                    subiu_escadas_sozinho_nao_realiza: stairs.notPerform,
                    subiu_escadas_sozinho_nao_soube_informar: stairs.didntKnow,
    
                    motricidade_fina: initialDevelopment.neuropsicomotor.motricidadeFina ?? null,
    
                    // fala / linguagem - marcos (meses + flags)
                    balbuciou_meses: babbled.months,
                    balbuciou_nao: babbled.notPerform,
                    balbuciou_nao_soube_informar: babbled.didntKnow,

                    primeiras_palavras_meses: firstWords.months,
                    primeiras_palavras_nao: firstWords.notPerform,
                    primeiras_palavras_nao_soube_informar: firstWords.didntKnow,

                    primeiras_frases_meses: firstSentences.months,
                    primeiras_frases_nao: firstSentences.notPerform,
                    primeiras_frases_nao_soube_informar: firstSentences.didntKnow,

                    apontou_para_fazer_pedidos_meses: pointing.months,
                    apontou_para_fazer_pedidos_nao: pointing.notPerform,
                    apontou_para_fazer_pedidos_nao_soube_informar: pointing.didntKnow,
    
                    // demais campos de fala/linguagem
                    faz_uso_de_gestos: mapSimNao(initialDevelopment.falaLinguagem.fazUsoDeGestos),
                    faz_uso_de_gestos_quais: initialDevelopment.falaLinguagem.fazUsoDeGestosQuais ?? null,
    
                    audicao: initialDevelopment.falaLinguagem.audicao ?? null,
    
                    teve_otite_de_repeticao: mapSimNao(initialDevelopment.falaLinguagem.teveOtiteDeRepeticao),
                    otite_vezes: initialDevelopment.falaLinguagem.otiteVezes ?? null,
                    otite_periodo_meses: initialDevelopment.falaLinguagem.otitePeriodoMeses ?? null,
                    otite_frequencia: initialDevelopment.falaLinguagem.otiteFrequencia ?? null,
    
                    faz_ou_fez_uso_tubo_ventilacao: mapSimNao(initialDevelopment.falaLinguagem.fazOuFezUsoTuboVentilacao),
                    tubo_ventilacao_observacao: initialDevelopment.falaLinguagem.tuboVentilacaoObservacao ?? null,
    
                    faz_ou_fez_uso_objeto_oral: mapSimNao(initialDevelopment.falaLinguagem.fazOuFezUsoObjetoOral),
                    objeto_oral_especificar: initialDevelopment.falaLinguagem.objetoOralEspecificar ?? null,
    
                    usa_mamadeira: mapSimNao(initialDevelopment.falaLinguagem.usaMamadeira),
                    mamadeira_ha: initialDevelopment.falaLinguagem.mamadeiraHa ?? null,
                    mamadeira_vezes_ao_dia: initialDevelopment.falaLinguagem.mamadeiraVezesAoDia ?? null,
    
                    comunicacao_atual: initialDevelopment.falaLinguagem.comunicacaoAtual ?? null,
                },
            },

            atividades_vida_diaria: {
                create: {
                    // desfralde
                    desfralde_diurno_urina_anos: daily.desfralde?.desfraldeDiurnoUrina?.anos ?? null,
                    desfralde_diurno_urina_meses: daily.desfralde?.desfraldeDiurnoUrina?.meses ?? null,
                    desfralde_diurno_urina_utiliza_fralda: daily.desfralde?.desfraldeDiurnoUrina?.utilizaFralda ?? null,

                    desfralde_noturno_urina_anos: daily.desfralde?.desfraldeNoturnoUrina?.anos ?? null,
                    desfralde_noturno_urina_meses: daily.desfralde?.desfraldeNoturnoUrina?.meses ?? null,
                    desfralde_noturno_urina_utiliza_fralda: daily.desfralde?.desfraldeNoturnoUrina?.utilizaFralda ?? null,

                    desfralde_fezes_anos: daily.desfralde?.desfraldeFezes?.anos ?? null,
                    desfralde_fezes_meses: daily.desfralde?.desfraldeFezes?.meses ?? null,
                    desfralde_fezes_utiliza_fralda: daily.desfralde?.desfraldeFezes?.utilizaFralda ?? null,

                    se_limpa_sozinho_urinar: mapSimNao(daily.desfralde?.seLimpaSozinhoUrinar),
                    se_limpa_sozinho_defecar: mapSimNao(daily.desfralde?.seLimpaSozinhoDefecar),
                    lava_as_maos_apos_uso_banheiro: mapSimNao(daily.desfralde?.lavaAsMaosAposUsoBanheiro),
                    apresenta_alteracao_habito_intestinal: mapSimNao(daily.desfralde?.apresentaAlteracaoHabitoIntestinal),
                    desfralde_observacoes: daily.desfralde?.observacoes ?? null,

                    // sono
                    dormem_media_horas_noite: daily.sono?.dormemMediaHorasNoite ?? null,
                    dormem_media_horas_dia: daily.sono?.dormemMediaHorasDia ?? null,
                    periodo_sono_dia: daily.sono?.periodoSonoDia ?? null,

                    tem_dificuldade_iniciar_sono: mapSimNao(daily.sono?.temDificuldadeIniciarSono),
                    acorda_de_madrugada: mapSimNao(daily.sono?.acordaDeMadrugada),
                    dorme_na_propria_cama: mapSimNao(daily.sono?.dormeNaPropriaCama),
                    dorme_no_proprio_quarto: mapSimNao(daily.sono?.dormeNoProprioQuarto),
                    apresenta_sono_agitado: mapSimNao(daily.sono?.apresentaSonoAgitado),
                    e_sonambulo: mapSimNao(daily.sono?.eSonambulo),

                    sono_observacoes: daily.sono?.observacoes ?? null,

                    // habitos de higiene
                    toma_banho_lava_corpo_todo: daily.habitosHigiene?.tomaBanhoLavaCorpoTodo ?? null,
                    seca_corpo_todo: daily.habitosHigiene?.secaCorpoTodo ?? null,
                    retira_todas_pecas_roupa: daily.habitosHigiene?.retiraTodasPecasRoupa ?? null,
                    coloca_todas_pecas_roupa: daily.habitosHigiene?.colocaTodasPecasRoupa ?? null,
                    poe_calcados_sem_cadarco: daily.habitosHigiene?.poeCalcadosSemCadarco ?? null,
                    poe_calcados_com_cadarco: daily.habitosHigiene?.poeCalcadosComCadarco ?? null,
                    escova_os_dentes: daily.habitosHigiene?.escovaOsDentes ?? null,
                    penteia_o_cabelo: daily.habitosHigiene?.penteiaOCabelo ?? null,

                    habitos_higiene_observacoes: daily.habitosHigiene?.observacoes ?? null,

                    // alimentacao
                    apresenta_queixa_alimentacao: mapSimNao(daily.alimentacao?.apresentaQueixaAlimentacao),
                    se_alimenta_sozinho: mapSimNao(daily.alimentacao?.seAlimentaSozinho),
                    e_seletivo_quanto_alimentos: mapSimNao(daily.alimentacao?.eSeletivoQuantoAlimentos),
                    passa_dia_inteiro_sem_comer: mapSimNao(daily.alimentacao?.passaDiaInteiroSemComer),
                    apresenta_rituais_para_alimentar: mapSimNao(daily.alimentacao?.apresentaRituaisParaAlimentar),
                    esta_abaixo_ou_acima_peso: mapSimNao(daily.alimentacao?.estaAbaixoOuAcimaPeso),

                    esta_abaixo_ou_acima_peso_descricao: daily.alimentacao?.estaAbaixoOuAcimaPesoDescricao ?? null,

                    tem_historico_anemia: mapSimNao(daily.alimentacao?.temHistoricoAnemia),
                    tem_historico_anemia_descricao: daily.alimentacao?.temHistoricoAnemiaDescricao ?? null,

                    rotina_alimentar_problema_familia: mapSimNao(daily.alimentacao?.rotinaAlimentarEProblemaFamilia),
                    rotina_alimentar_problema_familia_desc: daily.alimentacao?.rotinaAlimentarEProblemaFamiliaDescricao ?? null,

                    alimentacao_observacoes: daily.alimentacao?.observacoes ?? null,
                },
            },

            social_academico: {
                create: {
                    // desenvolvimento social
                    possui_amigos_mesma_idade_escola: mapSimNao(socialAcademic.desenvolvimentoSocial.possuiAmigosMesmaIdadeEscola),
                    possui_amigos_mesma_idade_fora_escola: mapSimNao(socialAcademic.desenvolvimentoSocial.possuiAmigosMesmaIdadeForaEscola),
                    faz_uso_funcional_brinquedos: mapSimNao(socialAcademic.desenvolvimentoSocial.fazUsoFuncionalBrinquedos),
                    brinca_proximo_aos_colegas: mapSimNao(socialAcademic.desenvolvimentoSocial.brincaProximoAosColegas),
                    brinca_conjunta_com_colegas: mapSimNao(socialAcademic.desenvolvimentoSocial.brincaConjuntaComColegas),
                    procura_colegas_espontaneamente: mapSimNao(socialAcademic.desenvolvimentoSocial.procuraColegasEspontaneamente),
                    se_verbal_inicia_conversa: mapSimNao(socialAcademic.desenvolvimentoSocial.seVerbalIniciaConversa),
                    se_verbal_responde_perguntas_simples: mapSimNao(socialAcademic.desenvolvimentoSocial.seVerbalRespondePerguntasSimples),
                    faz_pedidos_quando_necessario: mapSimNao(socialAcademic.desenvolvimentoSocial.fazPedidosQuandoNecessario),
                    estabelece_contato_visual_adultos: mapSimNao(socialAcademic.desenvolvimentoSocial.estabeleceContatoVisualAdultos),
                    estabelece_contato_visual_criancas: mapSimNao(socialAcademic.desenvolvimentoSocial.estabeleceContatoVisualCriancas),

                    desenvolvimento_social_observacoes: socialAcademic.desenvolvimentoSocial.observacoes ?? null,

                    // DESENVOLVIMENTO ACADÊMICO
                    ano: socialAcademic.desenvolvimentoAcademico.ano ?? null,
                    periodo: socialAcademic.desenvolvimentoAcademico.periodo ?? null,
                    direcao: socialAcademic.desenvolvimentoAcademico.direcao ?? null,
                    coordenacao: socialAcademic.desenvolvimentoAcademico.coordenacao ?? null,
                    professora_principal: socialAcademic.desenvolvimentoAcademico.professoraPrincipal ?? null,
                    professora_assistente: socialAcademic.desenvolvimentoAcademico.professoraAssistente ?? null,

                    frequenta_escola_regular: mapSimNao(socialAcademic.desenvolvimentoAcademico.frequentaEscolaRegular),
                    frequenta_escola_especial: mapSimNao(socialAcademic.desenvolvimentoAcademico.frequentaEscolaEspecial),
                    acompanha_turma_demandas_pedagogicas: mapSimNao(socialAcademic.desenvolvimentoAcademico.acompanhaTurmaDemandasPedagogicas),
                    segue_regras_rotina_sala_aula: mapSimNao(socialAcademic.desenvolvimentoAcademico.segueRegrasRotinaSalaAula),
                    necessita_apoio_at: mapSimNao(socialAcademic.desenvolvimentoAcademico.necessitaApoioAT),
                    necessita_adaptacao_materiais: mapSimNao(socialAcademic.desenvolvimentoAcademico.necessitaAdaptacaoMateriais),
                    necessita_adaptacao_curricular: mapSimNao(socialAcademic.desenvolvimentoAcademico.necessitaAdaptacaoCurricular),
                    houve_reprovacao_retencao: mapSimNao(socialAcademic.desenvolvimentoAcademico.houveReprovacaoRetencao),
                    escola_possui_equipe_inclusao: mapSimNao(socialAcademic.desenvolvimentoAcademico.escolaPossuiEquipeInclusao),
                    ha_indicativo_deficiencia_intelectual: mapSimNao(socialAcademic.desenvolvimentoAcademico.haIndicativoDeficienciaIntelectual),
                    escola_apresenta_queixa_comportamental: mapSimNao(socialAcademic.desenvolvimentoAcademico.escolaApresentaQueixaComportamental),

                    adaptacao_escolar: socialAcademic.desenvolvimentoAcademico.adaptacaoEscolar ?? null,
                    dificuldades_escolares: socialAcademic.desenvolvimentoAcademico.dificuldadesEscolares ?? null,
                    relacionamento_com_colegas: socialAcademic.desenvolvimentoAcademico.relacionamentoComColegas ?? null,
                    desenvolvimento_academico_observacoes: socialAcademic.desenvolvimentoAcademico.observacoes ?? null,
                },
            },

            comportamento: {
                create: {
                    // estereotipias / rituais
                    balanca_maos_lado_corpo_ou_frente: mapSimNao(behavior.estereotipiasRituais.balancaMaosLadoCorpoOuFrente),
                    balanca_corpo_frente_para_tras: mapSimNao(behavior.estereotipiasRituais.balancaCorpoFrenteParaTras),
                    pula_ou_gira_em_torno_de_si: mapSimNao(behavior.estereotipiasRituais.pulaOuGiraEmTornoDeSi),
                    repete_sons_sem_funcao_comunicativa: mapSimNao(behavior.estereotipiasRituais.repeteSonsSemFuncaoComunicativa),
                    repete_movimentos_continuos: mapSimNao(behavior.estereotipiasRituais.repeteMovimentosContinuos),
                    explora_ambiente_lambendo_tocando: mapSimNao(behavior.estereotipiasRituais.exploraAmbienteLambendoTocando),
                    procura_observar_objetos_canto_olho: mapSimNao(behavior.estereotipiasRituais.procuraObservarObjetosCantoOlho),
                    organiza_objetos_lado_a_lado: mapSimNao(behavior.estereotipiasRituais.organizaObjetosLadoALado),
                    realiza_tarefas_sempre_mesma_ordem: mapSimNao(behavior.estereotipiasRituais.realizaTarefasSempreMesmaOrdem),
                    apresenta_rituais_diarios: mapSimNao(behavior.estereotipiasRituais.apresentaRituaisDiarios),

                    estereotipias_rituais_observacoes_topografias: behavior.estereotipiasRituais.observacoesTopografias ?? null,

                    // PROBLEMAS DE COMPORTAMENTO
                    apresenta_comportamentos_auto_lesivos: mapSimNao(behavior.problemasComportamento.apresentaComportamentosAutoLesivos),
                    auto_lesivos_quais: behavior.problemasComportamento.autoLesivosQuais ?? null,

                    apresenta_comportamentos_heteroagressivos: mapSimNao(behavior.problemasComportamento.apresentaComportamentosHeteroagressivos),
                    heteroagressivos_quais: behavior.problemasComportamento.heteroagressivosQuais ?? null,

                    apresenta_destruicao_propriedade: mapSimNao(behavior.problemasComportamento.apresentaDestruicaoPropriedade),
                    destruicao_descrever: behavior.problemasComportamento.destruicaoDescrever ?? null,

                    necessitou_contencao_mecanica: mapSimNao(behavior.problemasComportamento.necessitouContencaoMecanica),

                    problemas_comportamento_observacoes_topografias: behavior.problemasComportamento.observacoesTopografias ?? null,
                },
            },

            finalizacao: {
                create: {
                    outras_informacoes_relevantes: finishing.outrasInformacoesRelevantes ?? null,
                    observacoes_impressoes_terapeuta: finishing.observacoesImpressoesTerapeuta ?? null,
                    expectativas_familia: finishing.expectativasFamilia ?? null,
                },
            },
        }
    })
}

function buildAnamneseWhere(
    filters: AnamneseListFilters,
    visibility: Awaited<ReturnType<typeof getVisibilityScope>>,
): Prisma.anamneseWhereInput {
    const where: Prisma.anamneseWhereInput = {};

    if (filters.q) {
        where.OR = [
            { cliente: { nome: { contains: filters.q } } },
            { cliente: { cpf: { contains: filters.q } } },
            {
                cliente: {
                    cuidadores: {
                        some: {
                            OR: [
                                { nome: { contains: filters.q } },
                                { telefone: { contains: filters.q } },
                                { cpf: { contains: filters.q } },
                            ],
                        },
                    },
                },
            },
            { terapeuta: { nome: { contains: filters.q } } },
        ];
    }

    if (visibility.scope === 'partial') {
        where.terapeuta_id = { in: visibility.therapistIds };
    }

    if (visibility.maxAccessLevel < MANAGER_LEVEL) {
        where.cliente = {
            status: 'ativo',
        } as Prisma.clienteWhereInput;
    }

    return where;
}

export async function list(
    therapistId: string,
    filters: AnamneseListFilters = {},
): Promise<AnamneseListResult> {
    if (!therapistId) {
        throw new AppError('REQUIRED_THERAPIST_ID', 'ID do terapeuta é obrigatório.', 400);
    }

    const visibility = await getVisibilityScope(therapistId);

    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.max(filters.pageSize ?? 10, 1);
    const [sortField = 'clienteNome', sortDirection = 'asc'] = (
        filters.sort ?? 'clienteNome_asc'
    ).split('_') as [string, 'asc' | 'desc'];

    if (visibility.scope === 'none') {
        return {
            items: [],
            total: 0,
            page,
            pageSize,
            totalPages: 0
        };
    }

    const sortOrder = sortDirection === 'desc' ? 'desc' : 'asc';
    let orderBy: Prisma.anamneseOrderByWithRelationInput;

    switch (sortField) {
        case 'dataEntrevista':
            orderBy = { data_entrevista: sortOrder };
            break;
        case 'profissionalNome':
            orderBy = { terapeuta: { nome: sortOrder } };
            break;
        case 'status':
            orderBy = { cliente: { status: sortOrder } };
            break;
        case 'clienteNome':
        default:
            orderBy = { cliente: { nome: sortOrder } };
            break;
    }

    const where = buildAnamneseWhere(filters, visibility);

    const [total, records] = await prisma.$transaction([
        prisma.anamnese.count({ where }),
        prisma.anamnese.findMany({
            where,
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
                id: true,
                data_entrevista: true,
                cliente: {
                    select: {
                        id: true,
                        nome: true,
                        status: true,
                        dataNascimento: true,
                        cuidadores: {
                            select: {
                                nome: true,
                                telefone: true,
                            },
                            take: 1,
                        },
                        arquivos: {
                            select: {
                                tipo: true,
                                arquivo_id: true,
                            },
                        },
                    },
                },
                terapeuta: {
                    select: {
                        nome: true,
                    },
                },
            },
        }),
    ]);

    const items = records.map((record) => {
        const avatar = record.cliente.arquivos.find((file) => file.tipo === 'fotoPerfil');
        const cuidador = record.cliente.cuidadores[0];
        const status: AnamneseListItem['status'] =
            record.cliente.status?.toLowerCase() === 'ativo' ? 'ATIVO' : 'INATIVO';

        return {
            id: String(record.id),
            clienteId: record.cliente.id,
            clienteNome: record.cliente.nome ?? '',
            clienteAvatarUrl: avatar?.arquivo_id
                ? `/api/arquivos/${encodeURIComponent(avatar.arquivo_id)}/view`
                : undefined,
            telefone: cuidador?.telefone ?? undefined,
            dataNascimento: record.cliente.dataNascimento
                ? record.cliente.dataNascimento.toISOString()
                : undefined,
            responsavel: cuidador?.nome ?? undefined,
            dataEntrevista: record.data_entrevista.toISOString(),
            profissionalNome: record.terapeuta.nome ?? '',
            status,
        };
    });

    return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}

export async function getAnamneseById(anamneseId: number) {
    const anamnese = await prisma.anamnese.findUnique({
        where: { id: anamneseId },
        select: {
            id: true,
            data_entrevista: true,
            cliente_id: true,
            cliente: {
                select: {
                    nome: true,
                    dataNascimento: true,
                    status: true,
                    dadosEscola: {
                        select: {
                            nome: true,
                        },
                    },
                    cuidadores: {
                        select: {
                            id: true,
                            nome: true,
                            relacao: true,
                            descricaoRelacao: true,
                            cpf: true,
                            telefone: true,
                            email: true,
                            profissao: true,
                            escolaridade: true,
                            dataNascimento: true,
                        },
                    },
                    arquivos: {
                        select: {
                            tipo: true,
                            arquivo_id: true,
                        },
                    },
                },
            },
            informante: true,
            parentesco: true,
            parentesco_descricao: true,
            quem_indicou: true,
            terapeuta_id: true,
            terapeuta: {
                select: {
                    nome: true,
                },
            },
            queixa_diagnostico: {
                select: {
                    queixa_principal: true,
                    diagnostico_previo: true,
                    suspeita_condicao_associada: true,
                    especialidades_consultada: {
                        select: {
                            id: true,
                            especialidade: true,
                            nome: true,
                            data: true,
                            observacao: true,
                            ativo: true,
                        }
                    }
                }
            },
            criado_em: true,
            atualizado_em: true,
        }
    });

    if (!anamnese) return null;
    
    const avatar = anamnese.cliente.arquivos.find((file) => file.tipo === 'fotoPerfil');

    const cuidadores = (anamnese.cliente.cuidadores ?? []).map((c) => ({
        id: c.id,
        nome: c.nome,
        relacao: c.relacao,
        descricaoRelacao: c.descricaoRelacao ?? null,
        cpf: c.cpf ?? null,
        telefone: c.telefone ?? null,
        email: c.email ?? null,
        profissao: c.profissao ?? null,
        escolaridade: c.escolaridade ?? null,
        dataNascimento: toDateOnly(c.dataNascimento),
    }));

    const cabecalho = {
        dataEntrevista: toDateOnly(anamnese.data_entrevista),
        clienteId: anamnese.cliente_id,
        clienteNome: anamnese.cliente.nome,
        clienteAvatarUrl: avatar?.arquivo_id
            ? `/api/arquivos/${encodeURIComponent(avatar.arquivo_id)}/view`
            : undefined,
        dataNascimento: anamnese.cliente.dataNascimento,
        idade: calculateAge(anamnese.cliente.dataNascimento),
        informante: anamnese.informante,
        parentesco: anamnese.parentesco,
        parentescoDescricao: anamnese.parentesco_descricao,
        quemIndicou: anamnese.quem_indicou,
        profissionalId: anamnese.terapeuta_id,
        profissionalNome: anamnese.terapeuta.nome,
        cuidadores,
        escolaCliente: anamnese.cliente.dadosEscola?.nome ?? null,
    };

    const especialidadesConsultadas = (anamnese.queixa_diagnostico?.especialidades_consultada ?? []).map((e) => ({
        id: e.id,
        especialidade: e.especialidade,
        nome: e.nome,
        data: e.data,
        observacao: e.observacao ?? null,
        ativo: e.ativo,
    }));

    const queixaDiagnostico = {
        queixaPrincipal: anamnese.queixa_diagnostico?.queixa_principal,
        diagnosticoPrevio: anamnese.queixa_diagnostico?.diagnostico_previo,
        suspeitaCondicaoAssociada: anamnese.queixa_diagnostico?.suspeita_condicao_associada,
        especialidadesConsultadas,
        medicamentosEmUso: MedicamentoEmUso[];
        examesPrevios: ExamePrevio[];
        terapiasPrevias: TerapiaPrevia[];
    };

    return {
        id: anamnese.id,
        cabecalho,
        queixaDiagnostico,
        contextoFamiliarRotina: AnamneseContextoFamiliarRotina;
        desenvolvimentoInicial: AnamneseDesenvolvimentoInicial;
        atividadesVidaDiaria: AnamneseAtividadesVidaDiaria;
        socialAcademico: AnamneseSocialAcademico;
        comportamento: AnamneseComportamento;
        finalizacao: AnamneseFinalizacao;
        status: anamnese.cliente.status,
        createdAt: anamnese.criado_em,
        updatedAt: anamnese.atualizado_em,
    };
}