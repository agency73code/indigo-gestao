import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { deleteFromR2 } from '../file/files.service.js';
import type { AnamnesePayload } from '../../schemas/anamnese.schema.js';
import { ACCESS_LEVELS } from '../../utils/accessLevels.js';
import { getVisibilityScope } from '../../utils/visibilityFilter.js';
import type { AnamneseListFilters, AnamneseListItem, AnamneseListResult } from './anamnese.types.js';
import { AppError } from '../../errors/AppError.js';
import { toDateOnly } from '../../utils/toDateOnly.js';
import { calculateAge } from '../../utils/calculateAge.js';
import { buildBehavior } from './builders/buildBehavior.js';
import { buildComplaintDiagnosis } from './builders/buildComplaintDiagnosis.js';
import { buildDaily } from './builders/buildDaily.js';
import { buildFamilyContextRoutine } from './builders/buildFamilyContextRoutine.js';
import { buildFinishing } from './builders/buildFinishing.js';
import { buildHeader } from './builders/buildHeader.js';
import { buildInitialDevelopment } from './builders/buildInitialDevelopment.js';
import { buildSocialAcademic } from './builders/buildSocialAcademic.js';

type SimNao = 'sim' | 'nao' | null | undefined;

const MANAGER_LEVEL = ACCESS_LEVELS['gerente'] ?? 5;

function mapSimNaoResponse(value?: boolean | null): SimNao {
    if (value === true) return 'sim';
    if (value === false) return 'nao';
    return null;
}

function mapMarcoResponse(params: {
    meses?: string | null;
    naoRealiza?: boolean | null;
    naoSoubeInformar?: boolean | null;
}) {
    const marco = {
        meses: params.meses ?? '',
        naoRealiza: params.naoRealiza ?? false,
        naoSoubeInformar: params.naoSoubeInformar ?? false,
    };

    return {
        ...marco,
        nao: marco.naoRealiza,
        status: marco.naoRealiza
            ? 'naoRealiza'
            : marco.naoSoubeInformar
                ? 'naoSoubeInformar'
                : undefined,
    };
}

function buildOtiteDetalhes(vezes?: number | null, periodoMeses?: number | null, frequencia?: string | null) {
    const parts: string[] = [];

    if (vezes !== null && vezes !== undefined) {
        parts.push(`${vezes}x`);
    }

    if (periodoMeses !== null && periodoMeses !== undefined) {
        parts.push(`${periodoMeses} meses`);
    }

    if (frequencia) {
        parts.push(frequencia);
    }

    return parts.length > 0 ? parts.join(' - ') : null;
}

function buildMamadeiraDetalhes(ha?: string | null, vezesAoDia?: number | null) {
    const parts: string[] = [];

    if (ha) {
        parts.push(`Há ${ha}`);
    }

    if (vezesAoDia !== null && vezesAoDia !== undefined) {
        parts.push(`${vezesAoDia}x ao dia`);
    }

    return parts.length > 0 ? parts.join(' - ') : null;
}

export async function create(payload: AnamnesePayload) {
    const header = payload.cabecalho;

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

    const data: Prisma.anamneseCreateInput = {
        ...buildHeader(payload.cabecalho),
        ...buildComplaintDiagnosis(payload.queixaDiagnostico),
        ...buildFamilyContextRoutine(payload.contextoFamiliarRotina),
        ...buildInitialDevelopment(payload.desenvolvimentoInicial),
        ...buildDaily(payload.atividadesVidaDiaria),
        ...buildSocialAcademic(payload.socialAcademico),
        ...buildBehavior(payload.comportamento),
        ...buildFinishing(payload.finalizacao),
    };

    return prisma.anamnese.create({
        data,
    });
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
                    },
                    medicamentos_em_uso: {
                        select: {
                            id: true,
                            nome: true,
                            dosagem: true,
                            data_inicio: true,
                            motivo: true,
                        },
                    },
                    exames_previos: {
                        select: {
                            id: true,
                            nome: true,
                            data: true,
                            resultado: true,
                            arquivos: {
                                select: {
                                    id: true,
                                    nome: true,
                                    caminho: true,
                                    tipo: true,
                                    tamanho: true,
                                },
                            },
                        },
                    },
                    terapias_previas: {
                        select: {
                            id: true,
                            profissional: true,
                            especialidade_abordagem: true,
                            tempo_intervencao: true,
                            observacao: true,
                            ativo: true,
                        },
                    },
                }
            },
            contexto_familiar_rotina: {
                select: {
                    historicos_familiares: {
                        select: {
                            id: true,
                            condicao_diagnostico: true,
                            parentesco: true,
                            observacao: true,
                        },
                    },
                    atividades_rotina: {
                        select: {
                            id: true,
                            atividade: true,
                            horario: true,
                            responsavel: true,
                            frequencia: true,
                            observacao: true,
                        },
                    },
                },
            },
            desenvolvimento_inicial: {
                select: {
                    tipo_parto: true,
                    semanas: true,
                    apgar_1_min: true,
                    apgar_5_min: true,
                    intercorrencias: true,
                    sustentou_cabeca_meses: true,
                    sustentou_cabeca_nao_realiza: true,
                    sustentou_cabeca_nao_soube_informar: true,
                    rolou_meses: true,
                    rolou_nao_realiza: true,
                    rolou_nao_soube_informar: true,
                    sentou_meses: true,
                    sentou_nao_realiza: true,
                    sentou_nao_soube_informar: true,
                    engatinhou_meses: true,
                    engatinhou_nao_realiza: true,
                    engatinhou_nao_soube_informar: true,
                    andou_com_apoio_meses: true,
                    andou_com_apoio_nao_realiza: true,
                    andou_com_apoio_nao_soube_informar: true,
                    andou_sem_apoio_meses: true,
                    andou_sem_apoio_nao_realiza: true,
                    andou_sem_apoio_nao_soube_informar: true,
                    correu_meses: true,
                    correu_nao_realiza: true,
                    correu_nao_soube_informar: true,
                    andou_de_motoca_meses: true,
                    andou_de_motoca_nao_realiza: true,
                    andou_de_motoca_nao_soube_informar: true,
                    andou_de_bicicleta_meses: true,
                    andou_de_bicicleta_nao_realiza: true,
                    andou_de_bicicleta_nao_soube_informar: true,
                    subiu_escadas_sozinho_meses: true,
                    subiu_escadas_sozinho_nao_realiza: true,
                    subiu_escadas_sozinho_nao_soube_informar: true,
                    motricidade_fina: true,
                    balbuciou_meses: true,
                    balbuciou_nao: true,
                    balbuciou_nao_soube_informar: true,
                    primeiras_palavras_meses: true,
                    primeiras_palavras_nao: true,
                    primeiras_palavras_nao_soube_informar: true,
                    primeiras_frases_meses: true,
                    primeiras_frases_nao: true,
                    primeiras_frases_nao_soube_informar: true,
                    apontou_para_fazer_pedidos_meses: true,
                    apontou_para_fazer_pedidos_nao: true,
                    apontou_para_fazer_pedidos_nao_soube_informar: true,
                    faz_uso_de_gestos: true,
                    faz_uso_de_gestos_quais: true,
                    audicao: true,
                    teve_otite_de_repeticao: true,
                    otite_vezes: true,
                    otite_periodo_meses: true,
                    otite_frequencia: true,
                    faz_ou_fez_uso_tubo_ventilacao: true,
                    tubo_ventilacao_observacao: true,
                    faz_ou_fez_uso_objeto_oral: true,
                    objeto_oral_especificar: true,
                    usa_mamadeira: true,
                    mamadeira_ha: true,
                    mamadeira_vezes_ao_dia: true,
                    comunicacao_atual: true,
                },
            },
            atividades_vida_diaria: {
                select: {
                    desfralde_diurno_urina_anos: true,
                    desfralde_diurno_urina_meses: true,
                    desfralde_diurno_urina_utiliza_fralda: true,
                    desfralde_noturno_urina_anos: true,
                    desfralde_noturno_urina_meses: true,
                    desfralde_noturno_urina_utiliza_fralda: true,
                    desfralde_fezes_anos: true,
                    desfralde_fezes_meses: true,
                    desfralde_fezes_utiliza_fralda: true,
                    se_limpa_sozinho_urinar: true,
                    se_limpa_sozinho_defecar: true,
                    lava_as_maos_apos_uso_banheiro: true,
                    apresenta_alteracao_habito_intestinal: true,
                    desfralde_observacoes: true,
                    dormem_media_horas_noite: true,
                    dormem_media_horas_dia: true,
                    periodo_sono_dia: true,
                    tem_dificuldade_iniciar_sono: true,
                    acorda_de_madrugada: true,
                    dorme_na_propria_cama: true,
                    dorme_no_proprio_quarto: true,
                    apresenta_sono_agitado: true,
                    e_sonambulo: true,
                    sono_observacoes: true,
                    toma_banho_lava_corpo_todo: true,
                    seca_corpo_todo: true,
                    retira_todas_pecas_roupa: true,
                    coloca_todas_pecas_roupa: true,
                    poe_calcados_sem_cadarco: true,
                    poe_calcados_com_cadarco: true,
                    escova_os_dentes: true,
                    penteia_o_cabelo: true,
                    habitos_higiene_observacoes: true,
                    apresenta_queixa_alimentacao: true,
                    se_alimenta_sozinho: true,
                    e_seletivo_quanto_alimentos: true,
                    passa_dia_inteiro_sem_comer: true,
                    apresenta_rituais_para_alimentar: true,
                    esta_abaixo_ou_acima_peso: true,
                    esta_abaixo_ou_acima_peso_descricao: true,
                    tem_historico_anemia: true,
                    tem_historico_anemia_descricao: true,
                    rotina_alimentar_problema_familia: true,
                    rotina_alimentar_problema_familia_desc: true,
                    alimentacao_observacoes: true,
                },
            },
            social_academico: {
                select: {
                    possui_amigos_mesma_idade_escola: true,
                    possui_amigos_mesma_idade_fora_escola: true,
                    faz_uso_funcional_brinquedos: true,
                    brinca_proximo_aos_colegas: true,
                    brinca_conjunta_com_colegas: true,
                    procura_colegas_espontaneamente: true,
                    se_verbal_inicia_conversa: true,
                    se_verbal_responde_perguntas_simples: true,
                    faz_pedidos_quando_necessario: true,
                    estabelece_contato_visual_adultos: true,
                    estabelece_contato_visual_criancas: true,
                    desenvolvimento_social_observacoes: true,
                    ano: true,
                    periodo: true,
                    direcao: true,
                    coordenacao: true,
                    professora_principal: true,
                    professora_assistente: true,
                    frequenta_escola_regular: true,
                    frequenta_escola_especial: true,
                    acompanha_turma_demandas_pedagogicas: true,
                    segue_regras_rotina_sala_aula: true,
                    necessita_apoio_at: true,
                    necessita_adaptacao_materiais: true,
                    necessita_adaptacao_curricular: true,
                    houve_reprovacao_retencao: true,
                    escola_possui_equipe_inclusao: true,
                    ha_indicativo_deficiencia_intelectual: true,
                    escola_apresenta_queixa_comportamental: true,
                    adaptacao_escolar: true,
                    dificuldades_escolares: true,
                    relacionamento_com_colegas: true,
                    desenvolvimento_academico_observacoes: true,
                },
            },
            comportamento: {
                select: {
                    balanca_maos_lado_corpo_ou_frente: true,
                    balanca_corpo_frente_para_tras: true,
                    pula_ou_gira_em_torno_de_si: true,
                    repete_sons_sem_funcao_comunicativa: true,
                    repete_movimentos_continuos: true,
                    explora_ambiente_lambendo_tocando: true,
                    procura_observar_objetos_canto_olho: true,
                    organiza_objetos_lado_a_lado: true,
                    realiza_tarefas_sempre_mesma_ordem: true,
                    apresenta_rituais_diarios: true,
                    estereotipias_rituais_observacoes_topografias: true,
                    apresenta_comportamentos_auto_lesivos: true,
                    auto_lesivos_quais: true,
                    apresenta_comportamentos_heteroagressivos: true,
                    heteroagressivos_quais: true,
                    apresenta_destruicao_propriedade: true,
                    destruicao_descrever: true,
                    necessitou_contencao_mecanica: true,
                    problemas_comportamento_observacoes_topografias: true,
                },
            },
            finalizacao: {
                select: {
                    outras_informacoes_relevantes: true,
                    observacoes_impressoes_terapeuta: true,
                    expectativas_familia: true,
                },
            },
            criado_em: true,
            atualizado_em: true,
        },
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
        dataNascimento: toDateOnly(anamnese.cliente.dataNascimento),
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
        id: String(e.id),
        especialidade: e.especialidade ?? '',
        nome: e.nome ?? '',
        data: e.data ?? '',
        observacao: e.observacao ?? null,
        ativo: e.ativo ?? false,
    }));

    const medicamentosEmUso = (anamnese.queixa_diagnostico?.medicamentos_em_uso ?? []).map((m) => ({
        id: String(m.id),
        nome: m.nome ?? '',
        dosagem: m.dosagem ?? '',
        dataInicio: m.data_inicio ?? '',
        motivo: m.motivo ?? '',
    }));

    const examesPrevios = (anamnese.queixa_diagnostico?.exames_previos ?? []).map((exame) => ({
        id: String(exame.id),
        nome: exame.nome ?? '',
        data: exame.data ?? '',
        resultado: exame.resultado ?? '',
        arquivos: (exame.arquivos ?? []).map((arquivo) => ({
            id: String(arquivo.id),
            nome: arquivo.nome ?? '',
            tipo: arquivo.tipo ?? '',
            tamanho: arquivo.tamanho ?? 0,
            url: arquivo.caminho ?? undefined,
        })),
    }));

    const terapiasPrevias = (anamnese.queixa_diagnostico?.terapias_previas ?? []).map((t) => ({
        id: String(t.id),
        profissional: t.profissional ?? '',
        especialidadeAbordagem: t.especialidade_abordagem ?? '',
        tempoIntervencao: t.tempo_intervencao ?? '',
        observacao: t.observacao ?? null,
        ativo: t.ativo ?? false,
    }));

    const queixaDiagnostico = {
        queixaPrincipal: anamnese.queixa_diagnostico?.queixa_principal ?? '',
        diagnosticoPrevio: anamnese.queixa_diagnostico?.diagnostico_previo ?? '',
        suspeitaCondicaoAssociada: anamnese.queixa_diagnostico?.suspeita_condicao_associada ?? '',
        especialidadesConsultadas,
        medicamentosEmUso,
        examesPrevios,
        terapiasPrevias,
    };

    const historicosFamiliares = (anamnese.contexto_familiar_rotina?.historicos_familiares ?? []).map((h) => ({
        id: String(h.id),
        condicaoDiagnostico: h.condicao_diagnostico ?? '',
        condicao: h.condicao_diagnostico ?? '',
        parentesco: h.parentesco ?? '',
        observacao: h.observacao ?? null,
    }));

    const atividadesRotina = (anamnese.contexto_familiar_rotina?.atividades_rotina ?? []).map((a) => ({
        id: String(a.id),
        atividade: a.atividade ?? '',
        horario: a.horario ?? '',
        responsavel: a.responsavel ?? '',
        frequencia: a.frequencia ?? '',
        observacao: a.observacao ?? null,
    }));

    const contextoFamiliarRotina = {
        historicosFamiliares,
        historicoFamiliar: historicosFamiliares,
        atividadesRotina,
        rotinaDiaria: atividadesRotina,
    };

    const desenvolvimentoInicial = anamnese.desenvolvimento_inicial
        ? {
            gestacaoParto: {
                tipoParto: anamnese.desenvolvimento_inicial.tipo_parto ?? null,
                semanas: anamnese.desenvolvimento_inicial.semanas ?? null,
                apgar1min: anamnese.desenvolvimento_inicial.apgar_1_min ?? null,
                apgar5min: anamnese.desenvolvimento_inicial.apgar_5_min ?? null,
                intercorrencias: anamnese.desenvolvimento_inicial.intercorrencias ?? '',
            },
            neuropsicomotor: {
                sustentouCabeca: mapMarcoResponse({
                    meses: anamnese.desenvolvimento_inicial.sustentou_cabeca_meses,
                    naoRealiza: anamnese.desenvolvimento_inicial.sustentou_cabeca_nao_realiza,
                    naoSoubeInformar: anamnese.desenvolvimento_inicial.sustentou_cabeca_nao_soube_informar,
                }),
                rolou: mapMarcoResponse({
                    meses: anamnese.desenvolvimento_inicial.rolou_meses,
                    naoRealiza: anamnese.desenvolvimento_inicial.rolou_nao_realiza,
                    naoSoubeInformar: anamnese.desenvolvimento_inicial.rolou_nao_soube_informar,
                }),
                sentou: mapMarcoResponse({
                    meses: anamnese.desenvolvimento_inicial.sentou_meses,
                    naoRealiza: anamnese.desenvolvimento_inicial.sentou_nao_realiza,
                    naoSoubeInformar: anamnese.desenvolvimento_inicial.sentou_nao_soube_informar,
                }),
                engatinhou: mapMarcoResponse({
                    meses: anamnese.desenvolvimento_inicial.engatinhou_meses,
                    naoRealiza: anamnese.desenvolvimento_inicial.engatinhou_nao_realiza,
                    naoSoubeInformar: anamnese.desenvolvimento_inicial.engatinhou_nao_soube_informar,
                }),
                andouComApoio: mapMarcoResponse({
                    meses: anamnese.desenvolvimento_inicial.andou_com_apoio_meses,
                    naoRealiza: anamnese.desenvolvimento_inicial.andou_com_apoio_nao_realiza,
                    naoSoubeInformar: anamnese.desenvolvimento_inicial.andou_com_apoio_nao_soube_informar,
                }),
                andouSemApoio: mapMarcoResponse({
                    meses: anamnese.desenvolvimento_inicial.andou_sem_apoio_meses,
                    naoRealiza: anamnese.desenvolvimento_inicial.andou_sem_apoio_nao_realiza,
                    naoSoubeInformar: anamnese.desenvolvimento_inicial.andou_sem_apoio_nao_soube_informar,
                }),
                correu: mapMarcoResponse({
                    meses: anamnese.desenvolvimento_inicial.correu_meses,
                    naoRealiza: anamnese.desenvolvimento_inicial.correu_nao_realiza,
                    naoSoubeInformar: anamnese.desenvolvimento_inicial.correu_nao_soube_informar,
                }),
                andouDeMotoca: mapMarcoResponse({
                    meses: anamnese.desenvolvimento_inicial.andou_de_motoca_meses,
                    naoRealiza: anamnese.desenvolvimento_inicial.andou_de_motoca_nao_realiza,
                    naoSoubeInformar: anamnese.desenvolvimento_inicial.andou_de_motoca_nao_soube_informar,
                }),
                andouDeBicicleta: mapMarcoResponse({
                    meses: anamnese.desenvolvimento_inicial.andou_de_bicicleta_meses,
                    naoRealiza: anamnese.desenvolvimento_inicial.andou_de_bicicleta_nao_realiza,
                    naoSoubeInformar: anamnese.desenvolvimento_inicial.andou_de_bicicleta_nao_soube_informar,
                }),
                subiuEscadasSozinho: mapMarcoResponse({
                    meses: anamnese.desenvolvimento_inicial.subiu_escadas_sozinho_meses,
                    naoRealiza: anamnese.desenvolvimento_inicial.subiu_escadas_sozinho_nao_realiza,
                    naoSoubeInformar: anamnese.desenvolvimento_inicial.subiu_escadas_sozinho_nao_soube_informar,
                }),
                motricidadeFina: anamnese.desenvolvimento_inicial.motricidade_fina ?? '',
            },
            falaLinguagem: {
                balbuciou: mapMarcoResponse({
                    meses: anamnese.desenvolvimento_inicial.balbuciou_meses,
                    naoRealiza: anamnese.desenvolvimento_inicial.balbuciou_nao,
                    naoSoubeInformar: anamnese.desenvolvimento_inicial.balbuciou_nao_soube_informar,
                }),
                primeirasPalavras: mapMarcoResponse({
                    meses: anamnese.desenvolvimento_inicial.primeiras_palavras_meses,
                    naoRealiza: anamnese.desenvolvimento_inicial.primeiras_palavras_nao,
                    naoSoubeInformar: anamnese.desenvolvimento_inicial.primeiras_palavras_nao_soube_informar,
                }),
                primeirasFrases: mapMarcoResponse({
                    meses: anamnese.desenvolvimento_inicial.primeiras_frases_meses,
                    naoRealiza: anamnese.desenvolvimento_inicial.primeiras_frases_nao,
                    naoSoubeInformar: anamnese.desenvolvimento_inicial.primeiras_frases_nao_soube_informar,
                }),
                apontouParaFazerPedidos: mapMarcoResponse({
                    meses: anamnese.desenvolvimento_inicial.apontou_para_fazer_pedidos_meses,
                    naoRealiza: anamnese.desenvolvimento_inicial.apontou_para_fazer_pedidos_nao,
                    naoSoubeInformar: anamnese.desenvolvimento_inicial.apontou_para_fazer_pedidos_nao_soube_informar,
                }),
                fazUsoDeGestos: mapSimNaoResponse(anamnese.desenvolvimento_inicial.faz_uso_de_gestos),
                fazUsoDeGestosQuais: anamnese.desenvolvimento_inicial.faz_uso_de_gestos_quais ?? '',
                audicao: anamnese.desenvolvimento_inicial.audicao ?? null,
                teveOtiteDeRepeticao: mapSimNaoResponse(anamnese.desenvolvimento_inicial.teve_otite_de_repeticao),
                otiteVezes: anamnese.desenvolvimento_inicial.otite_vezes ?? null,
                otitePeriodoMeses: anamnese.desenvolvimento_inicial.otite_periodo_meses ?? null,
                otiteFrequencia: anamnese.desenvolvimento_inicial.otite_frequencia ?? undefined,
                otiteDetalhes: buildOtiteDetalhes(
                    anamnese.desenvolvimento_inicial.otite_vezes,
                    anamnese.desenvolvimento_inicial.otite_periodo_meses,
                    anamnese.desenvolvimento_inicial.otite_frequencia,
                ),
                fazOuFezUsoTuboVentilacao: mapSimNaoResponse(
                    anamnese.desenvolvimento_inicial.faz_ou_fez_uso_tubo_ventilacao,
                ),
                tuboVentilacaoObservacao: anamnese.desenvolvimento_inicial.tubo_ventilacao_observacao ?? '',
                fazOuFezUsoObjetoOral: mapSimNaoResponse(
                    anamnese.desenvolvimento_inicial.faz_ou_fez_uso_objeto_oral,
                ),
                objetoOralEspecificar: anamnese.desenvolvimento_inicial.objeto_oral_especificar ?? '',
                usaMamadeira: mapSimNaoResponse(anamnese.desenvolvimento_inicial.usa_mamadeira),
                mamadeiraHa: anamnese.desenvolvimento_inicial.mamadeira_ha ?? undefined,
                mamadeiraVezesAoDia: anamnese.desenvolvimento_inicial.mamadeira_vezes_ao_dia ?? null,
                mamadeiraDetalhes: buildMamadeiraDetalhes(
                    anamnese.desenvolvimento_inicial.mamadeira_ha,
                    anamnese.desenvolvimento_inicial.mamadeira_vezes_ao_dia,
                ),
                comunicacaoAtual: anamnese.desenvolvimento_inicial.comunicacao_atual ?? '',
            },
        }
        : {
            gestacaoParto: {
                tipoParto: null,
                semanas: null,
                apgar1min: null,
                apgar5min: null,
                intercorrencias: '',
            },
            neuropsicomotor: {
                sustentouCabeca: mapMarcoResponse({}),
                rolou: mapMarcoResponse({}),
                sentou: mapMarcoResponse({}),
                engatinhou: mapMarcoResponse({}),
                andouComApoio: mapMarcoResponse({}),
                andouSemApoio: mapMarcoResponse({}),
                correu: mapMarcoResponse({}),
                andouDeMotoca: mapMarcoResponse({}),
                andouDeBicicleta: mapMarcoResponse({}),
                subiuEscadasSozinho: mapMarcoResponse({}),
                motricidadeFina: '',
            },
            falaLinguagem: {
                balbuciou: mapMarcoResponse({}),
                primeirasPalavras: mapMarcoResponse({}),
                primeirasFrases: mapMarcoResponse({}),
                apontouParaFazerPedidos: mapMarcoResponse({}),
                fazUsoDeGestos: null,
                fazUsoDeGestosQuais: '',
                audicao: null,
                teveOtiteDeRepeticao: null,
                otiteVezes: null,
                otitePeriodoMeses: null,
                otiteFrequencia: undefined,
                otiteDetalhes: null,
                fazOuFezUsoTuboVentilacao: null,
                tuboVentilacaoObservacao: '',
                fazOuFezUsoObjetoOral: null,
                objetoOralEspecificar: '',
                usaMamadeira: null,
                mamadeiraHa: undefined,
                mamadeiraVezesAoDia: null,
                mamadeiraDetalhes: null,
                comunicacaoAtual: '',
            },
        };

    const atividadesVidaDiaria = anamnese.atividades_vida_diaria
        ? {
            desfralde: {
                desfraldeDiurnoUrina: {
                    anos: anamnese.atividades_vida_diaria.desfralde_diurno_urina_anos ?? '',
                    meses: anamnese.atividades_vida_diaria.desfralde_diurno_urina_meses ?? '',
                    utilizaFralda: anamnese.atividades_vida_diaria.desfralde_diurno_urina_utiliza_fralda ?? false,
                },
                desfraldeNoturnoUrina: {
                    anos: anamnese.atividades_vida_diaria.desfralde_noturno_urina_anos ?? '',
                    meses: anamnese.atividades_vida_diaria.desfralde_noturno_urina_meses ?? '',
                    utilizaFralda: anamnese.atividades_vida_diaria.desfralde_noturno_urina_utiliza_fralda ?? false,
                },
                desfraldeFezes: {
                    anos: anamnese.atividades_vida_diaria.desfralde_fezes_anos ?? '',
                    meses: anamnese.atividades_vida_diaria.desfralde_fezes_meses ?? '',
                    utilizaFralda: anamnese.atividades_vida_diaria.desfralde_fezes_utiliza_fralda ?? false,
                },
                seLimpaSozinhoUrinar: mapSimNaoResponse(
                    anamnese.atividades_vida_diaria.se_limpa_sozinho_urinar,
                ),
                seLimpaSozinhoDefecar: mapSimNaoResponse(
                    anamnese.atividades_vida_diaria.se_limpa_sozinho_defecar,
                ),
                lavaAsMaosAposUsoBanheiro: mapSimNaoResponse(
                    anamnese.atividades_vida_diaria.lava_as_maos_apos_uso_banheiro,
                ),
                apresentaAlteracaoHabitoIntestinal: mapSimNaoResponse(
                    anamnese.atividades_vida_diaria.apresenta_alteracao_habito_intestinal,
                ),
                observacoes: anamnese.atividades_vida_diaria.desfralde_observacoes ?? '',
            },
            sono: {
                dormemMediaHorasNoite: anamnese.atividades_vida_diaria.dormem_media_horas_noite ?? '',
                dormemMediaHorasDia: anamnese.atividades_vida_diaria.dormem_media_horas_dia ?? '',
                periodoSonoDia: anamnese.atividades_vida_diaria.periodo_sono_dia ?? null,
                temDificuldadeIniciarSono: mapSimNaoResponse(
                    anamnese.atividades_vida_diaria.tem_dificuldade_iniciar_sono,
                ),
                acordaDeMadrugada: mapSimNaoResponse(
                    anamnese.atividades_vida_diaria.acorda_de_madrugada,
                ),
                dormeNaPropriaCama: mapSimNaoResponse(
                    anamnese.atividades_vida_diaria.dorme_na_propria_cama,
                ),
                dormeNoProprioQuarto: mapSimNaoResponse(
                    anamnese.atividades_vida_diaria.dorme_no_proprio_quarto,
                ),
                apresentaSonoAgitado: mapSimNaoResponse(
                    anamnese.atividades_vida_diaria.apresenta_sono_agitado,
                ),
                eSonambulo: mapSimNaoResponse(anamnese.atividades_vida_diaria.e_sonambulo),
                observacoes: anamnese.atividades_vida_diaria.sono_observacoes ?? '',
            },
            habitosHigiene: {
                tomaBanhoLavaCorpoTodo: anamnese.atividades_vida_diaria.toma_banho_lava_corpo_todo ?? null,
                secaCorpoTodo: anamnese.atividades_vida_diaria.seca_corpo_todo ?? null,
                retiraTodasPecasRoupa: anamnese.atividades_vida_diaria.retira_todas_pecas_roupa ?? null,
                colocaTodasPecasRoupa: anamnese.atividades_vida_diaria.coloca_todas_pecas_roupa ?? null,
                poeCalcadosSemCadarco: anamnese.atividades_vida_diaria.poe_calcados_sem_cadarco ?? null,
                poeCalcadosComCadarco: anamnese.atividades_vida_diaria.poe_calcados_com_cadarco ?? null,
                escovaOsDentes: anamnese.atividades_vida_diaria.escova_os_dentes ?? null,
                penteiaOCabelo: anamnese.atividades_vida_diaria.penteia_o_cabelo ?? null,
                observacoes: anamnese.atividades_vida_diaria.habitos_higiene_observacoes ?? '',
            },
            alimentacao: {
                apresentaQueixaAlimentacao: mapSimNaoResponse(
                    anamnese.atividades_vida_diaria.apresenta_queixa_alimentacao,
                ),
                seAlimentaSozinho: mapSimNaoResponse(anamnese.atividades_vida_diaria.se_alimenta_sozinho),
                eSeletivoQuantoAlimentos: mapSimNaoResponse(
                    anamnese.atividades_vida_diaria.e_seletivo_quanto_alimentos,
                ),
                passaDiaInteiroSemComer: mapSimNaoResponse(
                    anamnese.atividades_vida_diaria.passa_dia_inteiro_sem_comer,
                ),
                apresentaRituaisParaAlimentar: mapSimNaoResponse(
                    anamnese.atividades_vida_diaria.apresenta_rituais_para_alimentar,
                ),
                estaAbaixoOuAcimaPeso: mapSimNaoResponse(
                    anamnese.atividades_vida_diaria.esta_abaixo_ou_acima_peso,
                ),
                estaAbaixoOuAcimaPesoDescricao:
                    anamnese.atividades_vida_diaria.esta_abaixo_ou_acima_peso_descricao ?? '',
                temHistoricoAnemia: mapSimNaoResponse(
                    anamnese.atividades_vida_diaria.tem_historico_anemia,
                ),
                temHistoricoAnemiaDescricao:
                    anamnese.atividades_vida_diaria.tem_historico_anemia_descricao ?? '',
                rotinaAlimentarEProblemaFamilia: mapSimNaoResponse(
                    anamnese.atividades_vida_diaria.rotina_alimentar_problema_familia,
                ),
                rotinaAlimentarEProblemaFamiliaDescricao:
                    anamnese.atividades_vida_diaria.rotina_alimentar_problema_familia_desc ?? '',
                observacoes: anamnese.atividades_vida_diaria.alimentacao_observacoes ?? '',
            },
        }
        : {
            desfralde: {
                desfraldeDiurnoUrina: { anos: '', meses: '', utilizaFralda: false },
                desfraldeNoturnoUrina: { anos: '', meses: '', utilizaFralda: false },
                desfraldeFezes: { anos: '', meses: '', utilizaFralda: false },
                seLimpaSozinhoUrinar: null,
                seLimpaSozinhoDefecar: null,
                lavaAsMaosAposUsoBanheiro: null,
                apresentaAlteracaoHabitoIntestinal: null,
                observacoes: '',
            },
            sono: {
                dormemMediaHorasNoite: '',
                dormemMediaHorasDia: '',
                periodoSonoDia: null,
                temDificuldadeIniciarSono: null,
                acordaDeMadrugada: null,
                dormeNaPropriaCama: null,
                dormeNoProprioQuarto: null,
                apresentaSonoAgitado: null,
                eSonambulo: null,
                observacoes: '',
            },
            habitosHigiene: {
                tomaBanhoLavaCorpoTodo: null,
                secaCorpoTodo: null,
                retiraTodasPecasRoupa: null,
                colocaTodasPecasRoupa: null,
                poeCalcadosSemCadarco: null,
                poeCalcadosComCadarco: null,
                escovaOsDentes: null,
                penteiaOCabelo: null,
                observacoes: '',
            },
            alimentacao: {
                apresentaQueixaAlimentacao: null,
                seAlimentaSozinho: null,
                eSeletivoQuantoAlimentos: null,
                passaDiaInteiroSemComer: null,
                apresentaRituaisParaAlimentar: null,
                estaAbaixoOuAcimaPeso: null,
                estaAbaixoOuAcimaPesoDescricao: '',
                temHistoricoAnemia: null,
                temHistoricoAnemiaDescricao: '',
                rotinaAlimentarEProblemaFamilia: null,
                rotinaAlimentarEProblemaFamiliaDescricao: '',
                observacoes: '',
            },
        };

    const desenvolvimentoSocial = anamnese.social_academico
        ? {
            possuiAmigosMesmaIdadeEscola: mapSimNaoResponse(
                anamnese.social_academico.possui_amigos_mesma_idade_escola,
            ),
            possuiAmigosMesmaIdadeForaEscola: mapSimNaoResponse(
                anamnese.social_academico.possui_amigos_mesma_idade_fora_escola,
            ),
            fazUsoFuncionalBrinquedos: mapSimNaoResponse(
                anamnese.social_academico.faz_uso_funcional_brinquedos,
            ),
            brincaProximoAosColegas: mapSimNaoResponse(
                anamnese.social_academico.brinca_proximo_aos_colegas,
            ),
            brincaConjuntaComColegas: mapSimNaoResponse(
                anamnese.social_academico.brinca_conjunta_com_colegas,
            ),
            procuraColegasEspontaneamente: mapSimNaoResponse(
                anamnese.social_academico.procura_colegas_espontaneamente,
            ),
            seVerbalIniciaConversa: mapSimNaoResponse(
                anamnese.social_academico.se_verbal_inicia_conversa,
            ),
            seVerbalRespondePerguntasSimples: mapSimNaoResponse(
                anamnese.social_academico.se_verbal_responde_perguntas_simples,
            ),
            fazPedidosQuandoNecessario: mapSimNaoResponse(
                anamnese.social_academico.faz_pedidos_quando_necessario,
            ),
            estabeleceContatoVisualAdultos: mapSimNaoResponse(
                anamnese.social_academico.estabelece_contato_visual_adultos,
            ),
            estabeleceContatoVisualCriancas: mapSimNaoResponse(
                anamnese.social_academico.estabelece_contato_visual_criancas,
            ),
            observacoes: anamnese.social_academico.desenvolvimento_social_observacoes ?? '',
        }
        : undefined;

    const desenvolvimentoAcademico = anamnese.social_academico
        ? {
            escola: anamnese.cliente.dadosEscola?.nome ?? '',
            ano: anamnese.social_academico.ano ?? null,
            periodo: anamnese.social_academico.periodo ?? '',
            direcao: anamnese.social_academico.direcao ?? '',
            coordenacao: anamnese.social_academico.coordenacao ?? '',
            professoraPrincipal: anamnese.social_academico.professora_principal ?? '',
            professoraAssistente: anamnese.social_academico.professora_assistente ?? '',
            frequentaEscolaRegular: mapSimNaoResponse(
                anamnese.social_academico.frequenta_escola_regular,
            ),
            frequentaEscolaEspecial: mapSimNaoResponse(
                anamnese.social_academico.frequenta_escola_especial,
            ),
            acompanhaTurmaDemandasPedagogicas: mapSimNaoResponse(
                anamnese.social_academico.acompanha_turma_demandas_pedagogicas,
            ),
            segueRegrasRotinaSalaAula: mapSimNaoResponse(
                anamnese.social_academico.segue_regras_rotina_sala_aula,
            ),
            necessitaApoioAT: mapSimNaoResponse(anamnese.social_academico.necessita_apoio_at),
            necessitaAdaptacaoMateriais: mapSimNaoResponse(
                anamnese.social_academico.necessita_adaptacao_materiais,
            ),
            necessitaAdaptacaoCurricular: mapSimNaoResponse(
                anamnese.social_academico.necessita_adaptacao_curricular,
            ),
            houveReprovacaoRetencao: mapSimNaoResponse(
                anamnese.social_academico.houve_reprovacao_retencao,
            ),
            escolaPossuiEquipeInclusao: mapSimNaoResponse(
                anamnese.social_academico.escola_possui_equipe_inclusao,
            ),
            haIndicativoDeficienciaIntelectual: mapSimNaoResponse(
                anamnese.social_academico.ha_indicativo_deficiencia_intelectual,
            ),
            escolaApresentaQueixaComportamental: mapSimNaoResponse(
                anamnese.social_academico.escola_apresenta_queixa_comportamental,
            ),
            adaptacaoEscolar: anamnese.social_academico.adaptacao_escolar ?? '',
            dificuldadesEscolares: anamnese.social_academico.dificuldades_escolares ?? '',
            relacionamentoComColegas: anamnese.social_academico.relacionamento_com_colegas ?? '',
            observacoes: anamnese.social_academico.desenvolvimento_academico_observacoes ?? '',
        }
        : undefined;

    const interacaoSocial = desenvolvimentoSocial
        ? {
            ...desenvolvimentoSocial,
            brincaComOutrasCriancas:
                desenvolvimentoSocial.brincaConjuntaComColegas ?? desenvolvimentoSocial.brincaProximoAosColegas,
            tipoBrincadeira: desenvolvimentoSocial.observacoes ?? '',
            mantemContatoVisual:
                desenvolvimentoSocial.estabeleceContatoVisualCriancas ??
                desenvolvimentoSocial.estabeleceContatoVisualAdultos,
            respondeAoChamar: null,
            compartilhaInteresses: null,
            compreendeSentimentos: null,
        }
        : undefined;

    const socialAcademico = {
        desenvolvimentoSocial,
        interacaoSocial,
        desenvolvimentoAcademico,
        vidaEscolar: desenvolvimentoAcademico,
    };

    const comportamento = anamnese.comportamento
        ? {
            estereotipiasRituais: {
                balancaMaosLadoCorpoOuFrente: mapSimNaoResponse(
                    anamnese.comportamento.balanca_maos_lado_corpo_ou_frente,
                ),
                balancaCorpoFrenteParaTras: mapSimNaoResponse(
                    anamnese.comportamento.balanca_corpo_frente_para_tras,
                ),
                pulaOuGiraEmTornoDeSi: mapSimNaoResponse(
                    anamnese.comportamento.pula_ou_gira_em_torno_de_si,
                ),
                repeteSonsSemFuncaoComunicativa: mapSimNaoResponse(
                    anamnese.comportamento.repete_sons_sem_funcao_comunicativa,
                ),
                repeteMovimentosContinuos: mapSimNaoResponse(
                    anamnese.comportamento.repete_movimentos_continuos,
                ),
                exploraAmbienteLambendoTocando: mapSimNaoResponse(
                    anamnese.comportamento.explora_ambiente_lambendo_tocando,
                ),
                procuraObservarObjetosCantoOlho: mapSimNaoResponse(
                    anamnese.comportamento.procura_observar_objetos_canto_olho,
                ),
                organizaObjetosLadoALado: mapSimNaoResponse(
                    anamnese.comportamento.organiza_objetos_lado_a_lado,
                ),
                realizaTarefasSempreMesmaOrdem: mapSimNaoResponse(
                    anamnese.comportamento.realiza_tarefas_sempre_mesma_ordem,
                ),
                apresentaRituaisDiarios: mapSimNaoResponse(
                    anamnese.comportamento.apresenta_rituais_diarios,
                ),
                observacoesTopografias:
                    anamnese.comportamento.estereotipias_rituais_observacoes_topografias ?? '',
            },
            problemasComportamento: {
                apresentaComportamentosAutoLesivos: mapSimNaoResponse(
                    anamnese.comportamento.apresenta_comportamentos_auto_lesivos,
                ),
                autoLesivosQuais: anamnese.comportamento.auto_lesivos_quais ?? '',
                apresentaComportamentosHeteroagressivos: mapSimNaoResponse(
                    anamnese.comportamento.apresenta_comportamentos_heteroagressivos,
                ),
                heteroagressivosQuais: anamnese.comportamento.heteroagressivos_quais ?? '',
                apresentaDestruicaoPropriedade: mapSimNaoResponse(
                    anamnese.comportamento.apresenta_destruicao_propriedade,
                ),
                destruicaoDescrever: anamnese.comportamento.destruicao_descrever ?? '',
                necessitouContencaoMecanica: mapSimNaoResponse(
                    anamnese.comportamento.necessitou_contencao_mecanica,
                ),
                observacoesTopografias:
                    anamnese.comportamento.problemas_comportamento_observacoes_topografias ?? '',
            },
        }
        : {
            estereotipiasRituais: {
                balancaMaosLadoCorpoOuFrente: null,
                balancaCorpoFrenteParaTras: null,
                pulaOuGiraEmTornoDeSi: null,
                repeteSonsSemFuncaoComunicativa: null,
                repeteMovimentosContinuos: null,
                exploraAmbienteLambendoTocando: null,
                procuraObservarObjetosCantoOlho: null,
                organizaObjetosLadoALado: null,
                realizaTarefasSempreMesmaOrdem: null,
                apresentaRituaisDiarios: null,
                observacoesTopografias: '',
            },
            problemasComportamento: {
                apresentaComportamentosAutoLesivos: null,
                autoLesivosQuais: '',
                apresentaComportamentosHeteroagressivos: null,
                heteroagressivosQuais: '',
                apresentaDestruicaoPropriedade: null,
                destruicaoDescrever: '',
                necessitouContencaoMecanica: null,
                observacoesTopografias: '',
            },
        };

    const finalizacao = anamnese.finalizacao
        ? {
            outrasInformacoesRelevantes: anamnese.finalizacao.outras_informacoes_relevantes ?? '',
            observacoesImpressoesTerapeuta: anamnese.finalizacao.observacoes_impressoes_terapeuta ?? '',
            expectativasFamilia: anamnese.finalizacao.expectativas_familia ?? '',

            informacoesAdicionais: anamnese.finalizacao.outras_informacoes_relevantes ?? '',
            observacoesFinais: anamnese.finalizacao.observacoes_impressoes_terapeuta ?? '',
        }
        : {
            outrasInformacoesRelevantes: '',
            observacoesImpressoesTerapeuta: '',
            expectativasFamilia: '',

            informacoesAdicionais: '',
            observacoesFinais: '',
        };

    const status = anamnese.cliente.status?.toLowerCase() === 'ativo' ? 'ATIVO' : 'INATIVO';

    return {
        id: String(anamnese.id),
        cabecalho,
        queixaDiagnostico,
        contextoFamiliarRotina,
        desenvolvimentoInicial,
        atividadesVidaDiaria,
        socialAcademico,
        comportamento,
        finalizacao,
        status,
        createdAt: anamnese.criado_em,
        updatedAt: anamnese.atualizado_em,
    };
}

function buildReplaceList<T>(items?: Prisma.Enumerable<T>): { deleteMany: object; create?: Prisma.Enumerable<T> } {
    const result: { deleteMany: object; create?: Prisma.Enumerable<T> } = {
        deleteMany: {},
    };

    if (items === undefined) {
        return result;
    }

    if (Array.isArray(items) && items.length === 0) {
        return result;
    }

    result.create = items;
    return result;
}

export async function updateAnamneseById(anamneseId: number, payload: AnamnesePayload) {
    const existing = await prisma.anamnese.findUnique({
        where: { id: anamneseId },
        select: {
            id: true,
        },
    });

    if (!existing) {
        return null;
    }

    const removedFilePaths = (payload.queixaDiagnostico?.examesPrevios ?? []).flatMap((exame) =>
        (exame.arquivos ?? [])
            .filter((arquivo) => arquivo?.removed === true)
            .map((arquivo) => arquivo?.caminho ?? '')
            .filter((caminho) => caminho.length > 0),
    );

    const header = buildHeader(payload.cabecalho);
    const complaintCreate = buildComplaintDiagnosis(payload.queixaDiagnostico).queixa_diagnostico?.create;
    const familyCreate = buildFamilyContextRoutine(payload.contextoFamiliarRotina).contexto_familiar_rotina?.create;
    const initialCreate = buildInitialDevelopment(payload.desenvolvimentoInicial).desenvolvimento_inicial?.create;
    const dailyCreate = buildDaily(payload.atividadesVidaDiaria).atividades_vida_diaria?.create;
    const socialCreate = buildSocialAcademic(payload.socialAcademico).social_academico?.create;
    const behaviorCreate = buildBehavior(payload.comportamento).comportamento?.create;
    const finishingCreate = buildFinishing(payload.finalizacao).finalizacao?.create;

    if (
        !complaintCreate || !familyCreate ||
        !initialCreate || !dailyCreate ||
        !socialCreate || !behaviorCreate ||
        !finishingCreate
    ) {
        throw new AppError('INVALID_PAYLOAD', 'Payload de anamnese inválido.', 400);
    }

    const {
        especialidades_consultada,
        medicamentos_em_uso,
        exames_previos,
        terapias_previas,
        ...complaintFields
    } = complaintCreate;

    const {
        historicos_familiares,
        atividades_rotina,
        ...familyFields
    } = familyCreate;

    await prisma.anamnese.update({
        where: { id: anamneseId },
        data: {
            ...header,
            queixa_diagnostico: {
                upsert: {
                    create: complaintCreate,
                    update: {
                        ...complaintFields,
                        especialidades_consultada: buildReplaceList(especialidades_consultada?.create),
                        medicamentos_em_uso: buildReplaceList(medicamentos_em_uso?.create),
                        exames_previos: buildReplaceList(exames_previos?.create),
                        terapias_previas: buildReplaceList(terapias_previas?.create),
                    },
                },
            },
            contexto_familiar_rotina: {
                upsert: {
                    create: familyCreate,
                    update: {
                        ...familyFields,
                        historicos_familiares: buildReplaceList(historicos_familiares?.create),
                        atividades_rotina: buildReplaceList(atividades_rotina?.create),
                    },
                },
            },
            desenvolvimento_inicial: {
                upsert: {
                    create: initialCreate,
                    update: initialCreate,
                },
            },
            atividades_vida_diaria: {
                upsert: {
                    create: dailyCreate,
                    update: dailyCreate,
                },
            },
            social_academico: {
                upsert: {
                    create: socialCreate,
                    update: socialCreate,
                },
            },
            comportamento: {
                upsert: {
                    create: behaviorCreate,
                    update: behaviorCreate,
                },
            },
            finalizacao: {
                upsert: {
                    create: finishingCreate,
                    update: finishingCreate,
                },
            },
        },
    });

    const normalizeStorageKey = (caminho: string): string => {
        if (!caminho) {
            return '';
        }

        try {
            const parsed = new URL(caminho);
            return decodeURIComponent(parsed.pathname).replace(/^\/+/, '');
        } catch {
            return caminho.replace(/^\/+/, '');
        }
    };

    const removedKeys = removedFilePaths
        .map((path) => normalizeStorageKey(path))
        .filter((path) => path.length > 0);
    const deleteKeySet = new Set(removedKeys);
    const deletePathSet = new Set([...removedFilePaths, ...removedKeys].filter((path) => path.length > 0));

    if (deletePathSet.size > 0) {
        await prisma.anamnese_arquivo_exame_previo.deleteMany({
            where: {
                caminho: { in: Array.from(deletePathSet) },
                exame: { anamnese_id: anamneseId },
            },
        });
    }

    if (deleteKeySet.size > 0) {
        await Promise.all(Array.from(deleteKeySet).map((key) => deleteFromR2(key)));
    }

    return getAnamneseById(anamneseId);
}