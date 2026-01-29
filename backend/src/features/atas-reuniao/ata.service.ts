import OpenAI from 'openai';
import { PROMPTS_ATA, buildAtaPrompt } from '../ai/prompts/index.js';
import { AIServiceError } from '../ai/ai.errors.js';
import type { GerarResumoInput } from './ata.schema.js';
import { prisma } from '../../config/database.js';
import type { AtaListFilters, AtaListResult, CreateAtaServiceInput, UpdateAtaServiceInput } from './ata.types.js';
import { computeDurationMinutes } from './utils/computeDurationMinutes.js';
import { ata_finalidade_reuniao, ata_status, Prisma } from '@prisma/client';
import { R2GenericUploadService } from '../file/r2/r2-upload-generic.js';
import { AppError } from '../../errors/AppError.js';
import { calcularHorasFaturadasPorReuniao } from './utils/calcularHorasFaturadasPorReuniao.js';
import { ataSelectBase, ataSelectList, mapAtaBase, mapAtaListItem } from './ata.selectors.js';
import { ensureFilenameWithExt } from '../file/r2/ensureFilenameWithExt.js';
import { createBilling } from '../billing/billing.service.js';

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

export async function list(therapistId: string | null, filters: AtaListFilters = {}): Promise<AtaListResult> {
    if (therapistId === undefined) {
        throw new AppError('AUTH_REQUIRED', 'Usuário não autenticado.', 401)
    }

    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.max(filters.pageSize ?? 10, 1);
    const orderBy = filters.orderBy === 'oldest' ? 'asc' : 'desc';

    const where: Prisma.ata_reuniaoWhereInput = {
        ...(therapistId ? { terapeuta_id: therapistId } : {}),
        ...(filters.finalidade ? { finalidade: filters.finalidade } : {}),
        ...(filters.clienteId ? { cliente_id: filters.clienteId } : {}),
        ...(filters.dataInicio || filters.dataFim
            ? {
                data: {
                    ...(filters.dataInicio ? { gte: new Date(filters.dataInicio) } : {}),
                    ...(filters.dataFim ? { lte: new Date(filters.dataFim) } : {}),
                },
            }
            : {}),
    };

    if (filters.q) {
        const q = filters.q;
        
        where.OR = [
            { conteudo: { contains: q } },
            { participantes: { some: { nome: { contains: q } } } },
            { cliente: { is: { nome: { contains: q } } } },
        ];
    }

    const [total, atas] = await prisma.$transaction([
        prisma.ata_reuniao.count({ where }),
        prisma.ata_reuniao.findMany({
            where,
            orderBy: { data: orderBy },
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: ataSelectList,
        }),
    ]);

    const items = atas.map(mapAtaListItem);

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
    const { payload, billingInput, anexos } = input;

    const duracao = computeDurationMinutes(payload.horario_inicio, payload.horario_fim);
    const horasFaturadas =
        duracao !== null
            ? new Prisma.Decimal(calcularHorasFaturadasPorReuniao(duracao))
            : null;

    return await prisma.$transaction(async (tx) => {
          try {
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
                  throw new AppError('THERAPIST_NOT_FOUND', 'Terapeuta não encontrado');
              }
      
              const cabecalho_terapeuta_id = terapeuta.id;
              const cabecalho_terapeuta_nome = terapeuta.nome;
              const registro_principal = terapeuta.registro_profissional[0];
      
              if (cabecalho_terapeuta_nome.trim().length === 0) {
                  throw new AppError('THERAPIST_INVALID', 'Terapeuta sem nome válido');
              }
      
              // cria ata + filhos simples
              const ata = await tx.ata_reuniao.create({
                  data: {
                      terapeuta_id: payload.terapeuta_id,
                      cliente_id: payload.cliente_id ?? null,
      
                      data: payload.data,
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
                  select: ataSelectBase,
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
      
              await createBilling(tx, billingInput, { ataId: ata.id });
      
              // anexos: upload + cria registros
              if (anexos.length === 0) return ata;
      
              const uploaded = await R2GenericUploadService.uploadMany({
                  prefix: `atas/${ata.id}`,
                  files: anexos.map((a) => ({
                      buffer: a.buffer,
                      mimetype: a.mimetype,
                      originalname: a.originalname,
                      size: a.size,
                  })),
              });
      
              if (uploaded.length !== anexos.length) {
                  await R2GenericUploadService.deleteMany(uploaded.map((u) => u.key));
                  throw new AppError('UPLOAD_FAILED', 'Falha ao fazer upload dos arquivos do faturamento', 500);
              }
      
              try {
                  await tx.ata_anexo.createMany({
                      data: anexos.map((a, i) => ({
                          ata_reuniao_id: ata.id,
                          nome: ensureFilenameWithExt({name: a.nome, path: uploaded[i]!.key, mime_type: uploaded[i]!.tipo}),
                          original_nome: a.originalname,
                          caminho: uploaded[i]!.key,
                          mime_type: uploaded[i]!.tipo,
                          tamanho: uploaded[i]!.tamanho,
                      })),
                  });
              } catch (err) {
                  await Promise.allSettled([
                      R2GenericUploadService.deleteMany(uploaded.map((u) => u.key)),
                  ]);
                  throw err;
              }
      
              return ata;
        } catch (err) {
            console.error('[TX ERROR]', err);
            throw err;
        }
    });
}

export async function getById(id: number, userId?: string) {
    const ata = await prisma.ata_reuniao.findFirst({
        where: {
            id,
            ...(userId ? { terapeuta_id: userId } : {}),
        },
        select: ataSelectBase,
    });

    if (!ata) return null;

    return mapAtaBase(ata);
}

export async function finalizeAtaById(id: number, userId: string) {
    await prisma.ata_reuniao.update({
        where: { 
            id: id,
            terapeuta_id: userId,
            status: { not: ata_status.finalizada }
        },
        data: {
            status: ata_status.finalizada,
        }
    });

    const ata = await prisma.ata_reuniao.findUnique({
        where: { id },
        select: ataSelectBase,
    });

    return ata ? mapAtaBase(ata) : null;
}

export async function update(input: UpdateAtaServiceInput) {
    const { id, userId, payload, anexos } = input;

    const duracao_minutos = computeDurationMinutes(payload.horario_inicio, payload.horario_fim);
    const horas_faturadas =
        duracao_minutos !== null
            ? new Prisma.Decimal(calcularHorasFaturadasPorReuniao(duracao_minutos))
            : null;

    try {
        return await prisma.$transaction(async (tx) => {
            const existing = await tx.ata_reuniao.findFirst({
                where: { id, terapeuta_id: userId },
                select: {
                    id: true,
                    data: true,
                    horario_inicio: true,
                    horario_fim: true,
                },
            });
    
            if (!existing) throw new AppError('ATA_NOT_FOUND', 'Ata não encontrada');
    
            const ata = await tx.ata_reuniao.update({
                where: { id, terapeuta_id: userId },
                data: {
                    cliente_id: payload.cliente_id,
                    data: payload.data,
                    horario_inicio: payload.horario_inicio,
                    horario_fim: payload.horario_fim,
                    finalidade: payload.finalidade,
                    finalidade_outros: payload.finalidade_outros,
                    modalidade: payload.modalidade,
                    conteudo: payload.conteudo,
                    status: payload.status,
                    duracao_minutos,
                    horas_faturadas,
                },
                select: ataSelectBase
            });
    
            const participants = payload.participantes ?? [];
            type ParticipantInput = typeof participants[number];
            type ExistingParticipant = ParticipantInput & { id: number };
            const hasId = (p: ParticipantInput): p is ExistingParticipant => typeof p.id === 'number';
    
            if (participants && participants.length > 0) {
                const idsToDelete = participants
                    .filter((p) => p.removed === true)
                    .filter(hasId)
                    .map((p) => p.id);
    
                if (idsToDelete.length > 0) {
                    await tx.ata_participante.deleteMany({
                        where: {
                            ata_reuniao_id: id,
                            id: { in: idsToDelete }
                        }
                    });
                }
    
                const toUpdate = participants
                    .filter((p) => p.removed !== true)
                    .filter(hasId);
                
                await Promise.all(
                    toUpdate.map((p) =>
                        tx.ata_participante.update({
                            where: { id: p.id },
                            data: {
                                tipo: p.tipo,
                                nome: p.nome,
                                descricao: p.descricao,
                                terapeuta_id: p.terapeuta_id ?? null,
                            }
                        })
                    ),
                )
    
                const toCreate = participants.filter((p) => p.id === undefined);
                
                if (toCreate.length > 0) {
                    await tx.ata_participante.createMany({
                        data: toCreate.map((p) => ({
                            ata_reuniao_id: id,
                            tipo: p.tipo,
                            nome: p.nome,
                            descricao: p.descricao,
                            terapeuta_id: p.terapeuta_id ?? null
                        })),
                    });
                }
            }
    
            await tx.ata_link_recomendacao.deleteMany({ where: { ata_reuniao_id: id } });
            if (payload.links && payload.links.length > 0) {
                await tx.ata_link_recomendacao.createMany({
                    data: payload.links?.map((l) => ({
                        ata_reuniao_id: id,
                        titulo: l.titulo,
                        url: l.url,
                    }))
                });
            }
    
            // anexos: upload + cria registros
            if (anexos.length === 0) return ata;
    
            const uploaded = await R2GenericUploadService.uploadMany({
                prefix: `atas/${id}`,
                files: anexos.map((a) => ({
                    buffer: a.buffer,
                    mimetype: a.mimetype,
                    originalname: a.originalname,
                    size: a.size,
                })),
            });
    
            if (uploaded.length !== anexos.length) {
                await R2GenericUploadService.deleteMany(uploaded.map((u) => u.key));
                throw new AppError('UPLOAD_FAILED', 'Falha ao fazer upload dos arquivos do faturamento', 500);
            }
    
            try {
                await tx.ata_anexo.createMany({
                    data: anexos.map((a, i) => ({
                        ata_reuniao_id: id,
                        nome: ensureFilenameWithExt({name: a.nome, path: uploaded[i]!.key, mime_type: uploaded[i]!.tipo}),
                        original_nome: a.originalname,
                        caminho: uploaded[i]!.key,
                        mime_type: uploaded[i]!.tipo,
                        tamanho: uploaded[i]!.tamanho,
                    })),
                });
            } catch (err) {
                await Promise.allSettled([
                    R2GenericUploadService.deleteMany(uploaded.map((u) => u.key)),
                ]);
                throw err;
            }
    
            return ata;
        });
    }catch (err) {
        console.error('[TX ERROR]', err);
        throw err;
    }
}

export async function deleteAta(id: number, userId: string) {
    const ata = await prisma.$transaction(async (tx) => {
        const existing = await tx.ata_reuniao.findFirst({
            where: { id},
            select: {
                id: true,
                terapeuta_id: true,
                anexos: { select: { caminho: true } },
            },
        });

        if (!existing) return null;
        if (existing.terapeuta_id !== userId) return 'FORBIDDEN';
        
        await tx.ata_reuniao.delete({
            where: { id },
        });

        return existing;
    });

    if (!ata || ata === 'FORBIDDEN') return ata;

    return true;
}

export async function fileDownload(fileId: number, therapistId: string) {
    return await prisma.ata_anexo.findFirst({
        where: {
            id: fileId,
            ata_reuniao: {
                terapeuta_id: therapistId,
            },
        },
        select: {
            id: true,
            caminho: true,
            mime_type: true,
            nome: true,
            original_nome: true,
        },
    });
}

// ============================================
// HELPERS
// ============================================

export function buildFallbackTherapist(ata: {
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
