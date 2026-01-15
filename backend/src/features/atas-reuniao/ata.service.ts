import OpenAI from 'openai';
import { PROMPTS_ATA, buildAtaPrompt } from '../ai/prompts/index.js';
import { AIServiceError } from '../ai/ai.errors.js';
import type { GerarResumoInput } from './ata.schema.js';
import { prisma } from '../../config/database.js';
import type { AtaListFilters, AtaListResult, CreateAtaServiceInput } from './ata.types.js';
import { toDateOnlyLocal } from './utils/toDateOnlyLocal.js';
import { computeDurationMinutes } from './utils/computeDurationMinutes.js';
import { ata_finalidade_reuniao, Prisma } from '@prisma/client';
import { R2GenericUploadService } from '../file/r2/r2-upload-generic.js';
import { AppError } from '../../errors/AppError.js';
import { calcularHorasFaturadasPorReuniao } from './utils/calcularHorasFaturadasPorReuniao.js';

// Labels para exibição
const FINALIDADE_LABELS: Record<string, string> = {
    orientacao_parental: 'Orientação Parental',
    reuniao_equipe: 'Reunião de Equipe',
    reuniao_escola: 'Reunião com Escola',
    supervisao_terapeuta: 'Supervisão de Terapeuta',
    planejamento_terapeutico: 'Planejamento Terapêutico',
    devolutiva: 'Devolutiva',
    outros: 'Outros',
};

// Cliente OpenAI (singleton)
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!process.env.OPENAI_API_KEY) {
        throw new AIServiceError('AI_CONFIG_ERROR', 'OPENAI_API_KEY não configurada');
    }
    
    if (!openaiClient) {
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    
    return openaiClient;
}

/**
 * Gera resumo completo da ata via OpenAI
 */
export async function gerarResumoCompleto(params: GerarResumoInput): Promise<string> {
    const openai = getOpenAIClient();
    
    const prompt = buildAtaPrompt(PROMPTS_ATA.RESUMO_COMPLETO, {
        finalidade: FINALIDADE_LABELS[params.finalidade] || params.finalidade,
        data: params.data,
        participantes: params.participantes?.join(', ') || 'Não informados',
        conteudo: stripHtml(params.conteudo),
    });
    
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500, // Limita para forçar resumos concisos
    });
    
    const summary = completion.choices[0]?.message?.content;
    
    if (!summary) {
        throw new AIServiceError('AI_EMPTY_RESPONSE', 'Resposta vazia da IA');
    }
    
    return summary.trim();
}

/**
 * Gera mensagem estruturada para WhatsApp via OpenAI
 */
export async function gerarResumoWhatsApp(params: GerarResumoInput): Promise<string> {
    const openai = getOpenAIClient();
    
    // Monta horário formatado
    const horario = params.horarioInicio && params.horarioFim
        ? `${params.horarioInicio} - ${params.horarioFim}`
        : 'Não informado';
    
    // Monta seção de links
    const linksFormatados = params.links && params.links.length > 0
        ? params.links.map(l => `• ${l.titulo}: ${l.url}`).join('\n')
        : '';
    
    // Seção de links para incluir na mensagem (vazia se não houver links)
    const secaoLinks = params.links && params.links.length > 0
        ? `━━━━━━━━━━━━━━━━━━━━
🔗 *LINKS RECOMENDADOS*

${params.links.map(l => `• ${l.titulo}\n  ${l.url}`).join('\n\n')}`
        : '';
    
    const prompt = buildAtaPrompt(PROMPTS_ATA.RESUMO_WHATSAPP, {
        terapeuta: params.terapeuta,
        profissao: params.profissao,
        conselho: params.conselho || '',
        finalidade: FINALIDADE_LABELS[params.finalidade] || params.finalidade,
        data: formatarData(params.data),
        horario: horario,
        duracao: params.duracao || 'Não informada',
        cliente: params.cliente || 'Não informado',
        conteudo: stripHtml(params.conteudo),
        links: linksFormatados,
        secao_links: secaoLinks,
    });
    
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 800, // Aumentado para formato estruturado
    });
    
    const summary = completion.choices[0]?.message?.content;
    
    if (!summary) {
        throw new AIServiceError('AI_EMPTY_RESPONSE', 'Resposta vazia da IA');
    }
    
    return summary.trim();
}

export async function list(userId: string, filters: AtaListFilters = {}): Promise<AtaListResult> {
    if (!userId) {
        throw new AppError('AUTH_REQUIRED', 'Usuário não autenticado.', 401)
    }

    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.max(filters.pageSize ?? 10, 1);
    const orderBy = filters.orderBy === 'oldest' ? 'asc' : 'desc';

    const where: Prisma.ata_reuniaoWhereInput = {
        terapeuta_id: userId,
    };

    if (filters.finalidade) {
        where.finalidade = filters.finalidade;
    }

    if (filters.clienteId) {
        where.cliente_id = filters.clienteId;
    }

    
    if (filters.dataInicio || filters.dataFim) {
        where.data = {
            ...(filters.dataInicio ? { gte: new Date(filters.dataInicio) } : {}),
            ...(filters.dataFim ? { lte: new Date(filters.dataFim) } : {}),
        };
    }

    if (filters.q) {
        const q = filters.q;
        const matchingClients = await prisma.cliente.findMany({
            where: {
                nome: { contains: q },
            },
            select: { id: true },
        });

        const clientIds = matchingClients.map((client) => client.id);
        const orConditions: Prisma.ata_reuniaoWhereInput[] = [
            {
                conteudo: {
                    contains: q,
                },
            },
            {
                participantes: {
                    some: {
                        nome: {
                            contains: q,
                        },
                    },
                },
            },
        ];

        if (clientIds.length > 0) {
            orConditions.push({
                cliente_id: { in: clientIds },
            });
        }

        where.OR = orConditions;
    }

    const [total, atas] = await prisma.$transaction([
        prisma.ata_reuniao.count({ where }),
        prisma.ata_reuniao.findMany({
            where,
            orderBy: { data: orderBy },
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
                id: true,
                data: true,
                horario_inicio: true,
                horario_fim: true,
                finalidade: true,
                finalidade_outros: true,
                modalidade: true,
                conteudo: true,
                cliente_id: true,
                terapeuta_id: true,
                status: true,
                criado_em: true,
                atualizado_em: true,
                resumo_ia: true,
                duracao_minutos: true,
                horas_faturadas: true,
                cabecalho_terapeuta_id: true,
                cabecalho_terapeuta_nome: true,
                cabecalho_conselho_numero: true,
                cabecalho_area_atuacao: true,
                cabecalho_cargo: true,
                participantes: {
                    select: {
                        id: true,
                        tipo: true,
                        nome: true,
                        descricao: true,
                        terapeuta_id: true,
                    },
                },
                links: {
                    select: {
                        id: true,
                        titulo: true,
                        url: true,
                    },
                },
                anexos: {
                    select: {
                        id: true,
                        nome: true,
                        mime_type: true,
                        tamanho: true,
                        external_id: true,
                    },
                },
            },
        }),
    ]);

    const clientIds = Array.from(
        new Set(atas.map((ata) => ata.cliente_id).filter((id): id is string => Boolean(id))),
    );
    const therapistIds = new Set<string>();

    for (const ata of atas) {
        if (ata.terapeuta_id) therapistIds.add(ata.terapeuta_id);
        for (const participante of ata.participantes) {
            if (participante.terapeuta_id) therapistIds.add(participante.terapeuta_id);
        }
    }

    const [clientes, terapeutas] = await Promise.all([
        clientIds.length > 0
            ? prisma.cliente.findMany({
                where: { id: { in: clientIds } },
                select: { id: true, nome: true },
            })
            : Promise.resolve([]),
        therapistIds.size > 0
            ? prisma.terapeuta.findMany({
                where: { id: { in: Array.from(therapistIds) } },
                select: {
                    id: true,
                    nome: true,
                    registro_profissional: {
                        select: {
                            numero_conselho: true,
                            area_atuacao: {
                                select: { nome: true },
                            },
                            cargo: {
                                select: { nome: true },
                            },
                        },
                    },
                },
            })
            : Promise.resolve([]),
    ]);

    const clientMap = new Map(clientes.map((cliente) => [cliente.id, cliente]));
    const therapistMap = new Map(terapeutas.map((terapeuta) => [terapeuta.id, terapeuta]));

    const items = atas.map((ata) => {
        const therapist = therapistMap.get(ata.terapeuta_id) ?? buildFallbackTherapist(ata);

        return {
            ...ata,
            cliente: ata.cliente_id ? clientMap.get(ata.cliente_id) ?? null : null,
            terapeuta: therapist,
            participantes: ata.participantes.map((participante) => ({
                ...participante,
                terapeuta: participante.terapeuta_id
                    ? therapistMap.get(participante.terapeuta_id) ?? null
                    : null,
            })),
            anexos: ata.anexos.map((anexo) => ({
                ...anexo,
                arquivo_id: anexo.external_id,
            })),
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

export async function therapistsList(_userId: string, activity: boolean = true) {
    const therapists = await prisma.terapeuta.findMany({
        where: { atividade: activity },
        select: {
            id: true,
            nome: true,
            registro_profissional: {
                select: {
                    numero_conselho: true,
                    area_atuacao: {
                        select: {
                            nome: true,
                        }
                    },
                    cargo: {
                        select: {
                            nome: true,
                        },
                    },
                },
            },
        },
    });

    return therapists;
}

export async function therapistData(_userId: string) {
    const therapist = await prisma.terapeuta.findUnique({
        where: { id: _userId },
        select: {
            id: true,
            nome: true,
            registro_profissional: {
                select: {
                    numero_conselho: true,
                    area_atuacao: {
                        select: {
                            nome: true,
                        }
                    },
                    cargo: {
                        select: {
                            nome: true,
                        },
                    },
                },
            },
        },
    });

    return therapist;
}

export async function create(input: CreateAtaServiceInput) {
    const { payload, anexos } = input;

    // normalizações/calculados
    const dataEntrevista = toDateOnlyLocal(payload.data);
    const duracao = computeDurationMinutes(payload.horario_inicio, payload.horario_fim);

    // TODO: ajustar regra de faturamento
    const horasFaturadas =
        duracao !== null
            ? new Prisma.Decimal(calcularHorasFaturadasPorReuniao(duracao))
            : null;

    // transação: cria ata + filhos (participantes/links)
    const created = await prisma.$transaction(async (tx) => {
        const terapeuta = await tx.terapeuta.findUnique({
            where: { id: payload.terapeuta_id },
            select: {
                id: true,
                nome: true,
                registro_profissional: {
                    select: {
                        numero_conselho: true,
                        area_atuacao: {
                            select: {
                                nome: true,
                            }
                        },
                        cargo: {
                            select: {
                                nome: true,
                            },
                        },
                    },
                },
            }
        });

        if (!terapeuta) {
            throw new AppError('TERAPEUTA_NOT_FOUND', 'Terapeuta não encontrado');
        }

        const cabecalho_terapeuta_id = terapeuta.id;
        const cabecalho_terapeuta_nome = terapeuta.nome;
        const registro_principal = terapeuta.registro_profissional[0];

        if (cabecalho_terapeuta_nome.trim().length === 0) {
            throw new AppError('TERAPEUTA_INVALID', 'Terapeuta sem nome válido');
        }

        // cria ata + filhos simples
        const ata = await tx.ata_reuniao.create({
            data: {
                terapeuta_id: payload.terapeuta_id,
                cliente_id: payload.cliente_id ?? null,

                data: dataEntrevista,
                horario_inicio: payload.horario_inicio,
                horario_fim: payload.horario_fim,

                finalidade: payload.finalidade,
                finalidade_outros: payload.finalidade === ata_finalidade_reuniao.outros ? (payload.finalidade_outros ?? null) : null,
                
                modalidade: payload.modalidade,
                conteudo: payload.conteudo,
                status: payload.status,

                cabecalho_terapeuta_id,
                cabecalho_terapeuta_nome,
                cabecalho_conselho_numero: registro_principal?.numero_conselho ?? null,
                cabecalho_area_atuacao: registro_principal?.area_atuacao?.nome ?? null,
                cabecalho_cargo: registro_principal?.cargo?.nome ?? null,

                duracao_minutos: duracao ?? null,
                horas_faturadas: horasFaturadas,
            },
        });

        // participantes
        if (payload.participantes.length > 0) {
            await tx.ata_participante.createMany({
                data: payload.participantes.map((p) => ({
                    ata_reuniao_id: ata.id,
                    tipo: p.tipo,
                    nome: p.nome,
                    descricao: p.descricao ?? null,
                    terapeuta_id: p.terapeuta_id ?? null,
                })),
            });
        }

        // links
        const links = payload.links ?? [];
        if (Array.isArray(links) && links.length > 0) {
            await tx.ata_link_recomendacao.createMany({
                data: links.map((l) => ({
                    ata_reuniao_id: ata.id,
                    titulo: l.titulo,
                    url: l.url,
                })),
            });
        }

        // anexos: upload + cria registros
        if (anexos.length > 0) {
            const uploaded = await R2GenericUploadService.uploadMany({
                prefix: `atas/${ata.id}`,
                files: anexos.map((a) => ({
                    buffer: a.file.buffer,
                    mimetype: a.mime_type,
                    originalname: a.original_nome,
                    size: a.tamanho,
                })),
            });

            for (let i = 0; i < anexos.length; i += 1) {
                const a = anexos[i];
                const u = uploaded[i];

                if (!u) {
                    throw new Error(`Falha ao fazer upload de anexo`);
                }

                if (!a) {
                    throw new AppError('INVALID_PAYLOAD', 'arquivo é obrigatório');
                }

                await tx.ata_anexo.create({
                    data: {
                        ata_reuniao_id: ata.id,
                        external_id: a.external_id,

                        nome: a.nome ?? null,

                        original_nome: a.original_nome,
                        mime_type: a.mime_type,
                        tamanho: a.tamanho,

                        caminho: u.key,
                    },
                });
            }
        }
        
        // retorna ata completa
        const full = await tx.ata_reuniao.findUnique({
            where: { id: ata.id },
            include: {
                participantes: true,
                links: true,
                anexos: true,
            },
        });

        return full;
    });

    if (!created) {
        throw new Error('Falha ao criar ata.');
    }

    return created;
}

// ============================================
// HELPERS
// ============================================

function buildFallbackTherapist(ata: {
    cabecalho_terapeuta_id: string;
    cabecalho_terapeuta_nome: string;
    cabecalho_conselho_numero: string | null;
    cabecalho_area_atuacao: string | null;
    cabecalho_cargo: string | null;
}) {
    if (!ata.cabecalho_terapeuta_id && !ata.cabecalho_terapeuta_nome) {
        return null;
    }

    const areaNome = ata.cabecalho_area_atuacao || null;

    return {
        id: ata.cabecalho_terapeuta_id,
        nome: ata.cabecalho_terapeuta_nome,
        registro_profissional: [
            {
                numero_conselho: ata.cabecalho_conselho_numero,
                area_atuacao: areaNome ? { nome: areaNome } : null,
                cargo: ata.cabecalho_cargo ? { nome: ata.cabecalho_cargo } : null,
            },
        ],
    };
}

/**
 * Remove tags HTML do conteúdo
 */
function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Formata data para exibição (DD/MM/YYYY)
 */
function formatarData(dataIso: string): string {
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
}
