import OpenAI from 'openai';
import { PROMPTS_ATA, buildAtaPrompt } from '../ai/prompts/index.js';
import { AIServiceError } from '../ai/ai.errors.js';
import type { GerarResumoInput } from './ata.schema.js';
import { prisma } from '../../config/database.js';
import type { CreateAtaServiceInput } from './ata.types.js';
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
