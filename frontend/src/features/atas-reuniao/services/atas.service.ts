import { authFetch } from '@/lib/http';
import type {
    AtaReuniao,
    AtaListFilters,
    AtaListResponse,
    CreateAtaInput,
    UpdateAtaInput,
    TerapeutaOption,
    CabecalhoAta,
} from '../types';

import { atasConfig } from './atas.config';
import { debugFormData } from '@/lib/api';

// ============================================
// HELPERS - MAPEAMENTO API ↔ FRONTEND
// ============================================

/** Tamanho máximo de arquivo: 10MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Tipos de arquivo permitidos */
const ALLOWED_FILE_TYPES = [
    // Imagens
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
    // Vídeos
    'video/mp4',
    'video/webm',
    'video/quicktime',
    // Documentos
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Excel
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // PowerPoint
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Texto
    'text/plain',
    'text/csv',
    // Arquivos compactados
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/vnd.rar',
] as const;

/** Valida se arquivo é permitido */
function validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: `Arquivo muito grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB` };
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
        console.error('[validateFile] Tipo não permitido:', file.type, 'Nome:', file.name);
        return { valid: false, error: `Tipo de arquivo não permitido: ${file.type || 'desconhecido'} (${file.name})` };
    }

    return { valid: true };
}

/** Mapeamento de área de atuação para sigla do conselho profissional */
const AREA_PARA_SIGLA_CONSELHO: Record<string, string> = {
    'Fisioterapia': 'CREFITO',
    'Terapia Ocupacional': 'CREFITO',
    'Fonoaudiologia': 'CRFa',
    'Psicologia': 'CRP',
    'Neuropsicologia': 'CRP',
    'Psicopedagogia': 'CRP',
    'Terapia ABA': 'CRP',
    'Musicoterapia': 'CBMT',
    'Nutrição': 'CRN',
    'Enfermagem': 'COREN',
    'Medicina': 'CRM',
};

/** Obtém a sigla do conselho com base na área de atuação */
function getSiglaConselho(areaAtuacao: string | undefined): string {
    if (!areaAtuacao) return 'CRP';
    return AREA_PARA_SIGLA_CONSELHO[areaAtuacao] || 'CRP';
}

/** Converte resposta do backend (snake_case) para frontend (camelCase) */
function mapAtaFromApi(data: any): AtaReuniao {
    return {
        id: data.id,
        data: data.data,
        horarioInicio: data.horario_inicio,
        horarioFim: data.horario_fim,
        finalidade: data.finalidade,
        finalidadeOutros: data.finalidade_outros ?? '',
        modalidade: data.modalidade,
        conteudo: data.conteudo,
        clienteId: data.cliente_id ?? '',
        clienteNome: data.cliente?.nome ?? '',
        clienteAvatarUrl: data.clienteAvatarUrl ?? undefined,
        terapeutaAvatarUrl: data.terapeutaAvatarUrl ?? undefined,
        participantes: (data.participantes || []).map((p: any) => {
            const arquivoId = p.terapeuta?.arquivos?.[0]?.arquivo_id;
            return {
                id: p.id,
                localId: p.id ? String(p.id) : crypto.randomUUID(),
                tipo: p.tipo,
                nome: p.nome,
                descricao: p.descricao ?? '',
                terapeutaId: p.terapeuta_id,
                especialidade: p.terapeuta?.especialidade,
                cargo: p.terapeuta?.cargo,
                avatarUrl: arquivoId 
                    ? `${atasConfig.apiBase}/arquivos/${encodeURIComponent(arquivoId)}/view`
                    : undefined,
            };
        }),
        links: (data.links || []).map((l: any) => ({
            id: String(l.id),
            titulo: l.titulo,
            url: l.url,
        })),
        cabecalho: {
            terapeutaId: data.terapeuta_id,
            terapeutaNome: data.terapeuta?.nome || '',
            conselhoNumero: data.terapeuta?.registro_profissional?.[0]?.numero_conselho,
            conselhoTipo: getSiglaConselho(data.terapeuta?.registro_profissional?.[0]?.area_atuacao?.nome),
            profissao: data.terapeuta?.registro_profissional?.[0]?.area_atuacao?.nome,
            cargo: data.terapeuta?.registro_profissional?.[0]?.cargo?.nome,
        },
        status: data.status,
        criadoEm: data.criado_em,
        atualizadoEm: data.atualizado_em,
        resumoIA: data.resumo_ia,
        duracaoMinutos: data.duracao_minutos,
        horasFaturadas: data.horas_faturadas,
        anexos: (data.anexos || []).map((a: any) => ({
            id: String(a.id),
            name: a.nome ?? a.original_nome,
            size: a.tamanho,
            type: a.mime_type,
            arquivoId: a.arquivo_id,
            url: `${atasConfig.apiBase}/atas-reuniao/download/${a.id}`,
        })),
        // Dados de faturamento (ajuda de custo)
        faturamento: data.tipo_faturamento ? {
            tipoFaturamento: data.tipo_faturamento,
            observacaoFaturamento: data.observacao_faturamento || '',
            temAjudaCusto: Boolean(data.tem_ajuda_custo),
            motivoAjudaCusto: data.motivo_ajuda_custo || '',
            arquivosFaturamento: (data.arquivos_faturamento || []).map((a: any) => ({
                id: String(a.id),
                nome: a.nome ?? a.original_nome,
                tipo: a.mime_type,
                tamanho: a.tamanho,
                url: a.arquivo_id ? `${atasConfig.apiBase}/arquivos/${encodeURIComponent(a.arquivo_id)}/view` : undefined,
            })),
        } : undefined,
    };
}

/** Converte input do frontend para formato do backend (CREATE) */
function mapCreateAtaToApi(input: CreateAtaInput): Record<string, unknown> {
    const { formData, cabecalho, status } = input;

    return {
        terapeuta_id: cabecalho.terapeutaId,
        cliente_id: formData.clienteId || null,
        data: formData.data,
        horario_inicio: formData.horarioInicio,
        horario_fim: formData.horarioFim,
        finalidade: formData.finalidade,
        finalidade_outros: formData.finalidadeOutros || null,
        modalidade: formData.modalidade,
        conteudo: formData.conteudo,
        status: status || 'rascunho',
        participantes: formData.participantes.map((p) => ({
            ...(p.id !== undefined ? { id: p.id } : {}),
            tipo: p.tipo,
            nome: p.nome,
            descricao: p.descricao || null,
            terapeuta_id: p.terapeutaId || null,
            ...(p.removed ? { removed: true } : {}),
        })),
        links: formData.links?.map((l) => ({
            titulo: l.titulo,
            url: l.url,
        })) || [],
    };
}

/** Converte input do frontend para formato do backend (UPDATE) */
function mapUpdateAtaToApi(input: UpdateAtaInput): Record<string, unknown> {
    const { formData, status } = input;
    const payload: Record<string, unknown> = {};

    // Status sempre é enviado se definido
    if (status) payload.status = status;

    // Só envia campos que existem no Partial
    if (formData.data !== undefined) payload.data = formData.data;
    if (formData.horarioInicio !== undefined) payload.horario_inicio = formData.horarioInicio;
    if (formData.horarioFim !== undefined) payload.horario_fim = formData.horarioFim;
    if (formData.finalidade !== undefined) payload.finalidade = formData.finalidade;
    if (formData.finalidadeOutros !== undefined) payload.finalidade_outros = formData.finalidadeOutros || null;
    if (formData.modalidade !== undefined) payload.modalidade = formData.modalidade;
    if (formData.conteudo !== undefined) payload.conteudo = formData.conteudo;
    if (formData.clienteId !== undefined) payload.cliente_id = formData.clienteId || null;
    if (formData.participantes !== undefined) {
        payload.participantes = formData.participantes.map((p) => ({
            ...(p.id !== undefined ? { id: p.id } : {}),
            tipo: p.tipo,
            nome: p.nome,
            descricao: p.descricao || null,
            terapeuta_id: p.terapeutaId || null,
            ...(p.removed ? { removed: true } : {}),
        }));
    }
    if (formData.links !== undefined) {
        payload.links = formData.links.map((l) => ({
            titulo: l.titulo,
            url: l.url,
        }));
    }
    
    return payload;
}

function buildQueryString(filters?: AtaListFilters): string {
    if (!filters) return '';
    
    const params = new URLSearchParams();
    if (filters.q) params.append('q', filters.q);
    if (filters.finalidade && filters.finalidade !== 'all') {
        params.append('finalidade', filters.finalidade);
    }
    if (filters.dataInicio) params.append('data_inicio', filters.dataInicio);
    if (filters.dataFim) params.append('data_fim', filters.dataFim);
    if (filters.terapeutaId) params.append('terapeuta_id', filters.terapeutaId);
    if (filters.clienteId) params.append('cliente_id', filters.clienteId);
    if (filters.orderBy) params.append('order_by', filters.orderBy);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.pageSize) params.append('page_size', String(filters.pageSize));
    
    const qs = params.toString();
    return qs ? `?${qs}` : '';
}

// ============================================
// ATAS CRUD
// ============================================

export async function listAtas(filters?: AtaListFilters): Promise<AtaListResponse> {
    const res = await authFetch(`${atasConfig.apiBase}/atas-reuniao${buildQueryString(filters)}`);
    if (!res.ok) throw new Error('Falha ao carregar atas de reunião');
    
    const data = await res.json();
    return {
        items: data.items.map(mapAtaFromApi),
        total: data.total,
        page: data.page,
        pageSize: data.page_size,
        totalPages: data.total_pages,
    };
}

export async function getAtaById(id: string): Promise<AtaReuniao | null> {
    const res = await authFetch(`${atasConfig.apiBase}/atas-reuniao/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Falha ao carregar ata');
    
    const data = await res.json();

    return mapAtaFromApi(data.data);
}

export async function createAta(input: CreateAtaInput): Promise<AtaReuniao> {
    const fd = new FormData();

    // JSON do payload (sem os arquivos)
    fd.append('payload', JSON.stringify(mapCreateAtaToApi(input)));

    // Dados de faturamento (padrão: campo "data")
    fd.append('data', JSON.stringify({
        faturamento: input.formData.faturamento ? {
            tipoAtendimento: input.formData.faturamento.tipoFaturamento,
            ajudaCusto: input.formData.faturamento.temAjudaCusto,
            observacaoFaturamento: input.formData.faturamento.motivoAjudaCusto ?? null,
            dataSessao: input.formData.data,
            horarioInicio: input.formData.horarioInicio,
            horarioFim: input.formData.horarioFim,
        } : null,
    }));

    // Adiciona os arquivos com seus IDs e nomes personalizados
    const anexos = input.anexos ?? [];
    for (const anexo of anexos) {
        if (anexo.file instanceof File) {
            const validation = validateFile(anexo.file);
            if (!validation.valid) {
                throw new Error(validation.error || 'Arquivo inválido');
            }
            // Formato: files[id] = arquivo, nome enviado separadamente
            fd.append(`files[${anexo.id}]`, anexo.file, anexo.file.name);
            fd.append(`fileNames[${anexo.id}]`, anexo.nome);
        }
    }

    // Adiciona comprovantes de faturamento (ajuda de custo)
    const billingFiles = input.formData.faturamento?.arquivosFaturamento ?? [];
    for (const arquivo of billingFiles) {
        if (!arquivo.file) continue;
        const validation = validateFile(arquivo.file);
        if (!validation.valid) {
            throw new Error(validation.error || 'Arquivo de faturamento inválido');
        }
        fd.append(`billingFiles`, arquivo.file, arquivo.file.name);
        fd.append(`billingFileNames`, arquivo.nome);
    }
    
    const res = await authFetch(`${atasConfig.apiBase}/atas-reuniao`, {
        method: 'POST',
        body: fd,
    });
    
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Falha ao criar ata');
    }
    
    const data = await res.json();
    return mapAtaFromApi(data);
}

export async function updateAta(id: string, input: UpdateAtaInput): Promise<AtaReuniao | null> {
    const fd = new FormData();

    // JSON do payload (sem os arquivos)
    fd.append('payload', JSON.stringify(mapUpdateAtaToApi(input)));

    // Dados de faturamento (padrão: campo "data")
    if (input.formData.faturamento !== undefined) {
        fd.append('data', JSON.stringify({
            faturamento: input.formData.faturamento ? {
                tipoAtendimento: input.formData.faturamento.tipoFaturamento,
                ajudaCusto: input.formData.faturamento.temAjudaCusto,
                observacaoFaturamento: input.formData.faturamento.motivoAjudaCusto ?? null,
                dataSessao: input.formData.data,
                horarioInicio: input.formData.horarioInicio,
                horarioFim: input.formData.horarioFim,
            } : null,
        }));
    }

    // Adiciona os arquivos com seus IDs e nomes personalizados
    const anexos = input.anexos ?? [];
    for (const anexo of anexos) {
        if (anexo.file instanceof File) {
            const validation = validateFile(anexo.file);
            if (!validation.valid) {
                throw new Error(validation.error || 'Arquivo inválido');
            }
            fd.append(`files[${anexo.id}]`, anexo.file, anexo.file.name);
            fd.append(`fileNames[${anexo.id}]`, anexo.nome);
        }
    }

    // Adiciona comprovantes de faturamento (ajuda de custo)
    const billingFiles = input.formData.faturamento?.arquivosFaturamento ?? [];
    for (const arquivo of billingFiles) {
        if (!arquivo.file) continue;
        const validation = validateFile(arquivo.file);
        if (!validation.valid) {
            throw new Error(validation.error || 'Arquivo de faturamento inválido');
        }
        fd.append(`billingFiles`, arquivo.file, arquivo.file.name);
        fd.append(`billingFileNames`, arquivo.nome);
    }

    const debug = debugFormData(fd);
    console.log(debug);

    const res = await authFetch(`${atasConfig.apiBase}/atas-reuniao/${id}`, {
        method: 'PATCH',
        body: fd,
    });
    
    if (res.status === 404) return null;
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Falha ao atualizar ata');
    }
    
    const data = await res.json();
    return mapAtaFromApi(data);
}

export async function deleteAta(id: string): Promise<boolean> {
    const res = await authFetch(`${atasConfig.apiBase}/atas-reuniao/${id}`, { method: 'DELETE' });

    if (!res.ok) {
        const data = await res.json().catch(() => null) as { message?: string } | null;
        throw new Error(data?.message ?? 'Falha ao apagar ata');
    }

    return res.ok;
}

export async function finalizarAta(id: string): Promise<AtaReuniao | null> {
    const res = await authFetch(`${atasConfig.apiBase}/atas-reuniao/${id}/finalizar`, { method: 'POST' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Falha ao finalizar ata');
    
    const data = await res.json();
    return mapAtaFromApi(data.data);
}

// ============================================
// IA - GERAÇÃO DE RESUMO
// ============================================

interface GerarResumoParams {
    conteudo: string;
    finalidade: string;
    data: string;
    participantes?: string[];
    terapeuta: string;
    profissao: string;
    cliente?: string;
    // Campos extras para WhatsApp
    horarioInicio?: string;
    horarioFim?: string;
    duracao?: string;
    conselho?: string;
    // Links de recomendação
    links?: Array<{ titulo: string; url: string }>;
}

/** Formata duração em minutos para texto legível */
function formatarDuracaoTexto(horarioInicio: string, horarioFim: string): string {
    const [horaInicio, minInicio] = horarioInicio.split(':').map(Number);
    const [horaFim, minFim] = horarioFim.split(':').map(Number);
    
    const inicioMinutos = horaInicio * 60 + minInicio;
    const fimMinutos = horaFim * 60 + minFim;
    const duracaoMinutos = fimMinutos - inicioMinutos;
    
    if (duracaoMinutos <= 0) return 'Não calculada';
    
    const horas = Math.floor(duracaoMinutos / 60);
    const minutos = duracaoMinutos % 60;
    
    if (horas === 0) return `${minutos}min`;
    if (minutos === 0) return `${horas}h`;
    return `${horas}h ${minutos}min`;
}

/** Monta payload para API de IA a partir de uma ata */
function buildResumoPayload(ata: AtaReuniao): GerarResumoParams {
    const conselhoParts = [ata.cabecalho.conselhoTipo, ata.cabecalho.conselhoNumero].filter(Boolean);
    
    return {
        conteudo: ata.conteudo,
        finalidade: ata.finalidade,
        data: ata.data,
        participantes: ata.participantes.map(p => {
            const parts = [p.nome];
            if (p.descricao) parts.push(`(${p.descricao})`);
            return parts.join(' ');
        }),
        terapeuta: ata.cabecalho.terapeutaNome,
        profissao: ata.cabecalho.profissao || '',
        cliente: ata.clienteNome,
        // Campos extras para WhatsApp
        horarioInicio: ata.horarioInicio,
        horarioFim: ata.horarioFim,
        duracao: formatarDuracaoTexto(ata.horarioInicio, ata.horarioFim),
        conselho: conselhoParts.length > 0 ? conselhoParts.join(' ') : undefined,
        // Links de recomendação
        links: ata.links?.map(l => ({ titulo: l.titulo, url: l.url })),
    };
}

export async function generateSummary(ata: AtaReuniao): Promise<string> {
    const payload = buildResumoPayload(ata);
    const res = await authFetch(`${atasConfig.apiBase}/atas-reuniao/ai/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Falha ao gerar resumo');
    
    const data = await res.json();
    return data.summary;
}

export async function generateWhatsAppSummary(ata: AtaReuniao): Promise<string> {
    const payload = buildResumoPayload(ata);
    const res = await authFetch(`${atasConfig.apiBase}/atas-reuniao/ai/whatsapp-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Falha ao gerar resumo para WhatsApp');
    
    const data = await res.json();
    return data.summary;
}

// ============================================
// DADOS AUXILIARES (usa endpoints existentes)
// ============================================

export async function listTerapeutas(): Promise<TerapeutaOption[]> {
    const res = await authFetch(`${atasConfig.apiBase}/atas-reuniao/terapeutas?atividade=true`);
    if (!res.ok) throw new Error('Falha ao carregar terapeutas');
    
    const data = await res.json();

    return data.map((t: any) => {
        const registros = t.registro_profissional ?? [];
        const primeiroRegistro = registros[0];
        
        // Mapeia todos os registros profissionais
        const dadosProfissionais = registros.map((rp: any) => ({
            cargo: rp.cargo?.nome ?? '',
            areaAtuacao: rp.area_atuacao?.nome ?? '',
            numeroConselho: rp.numero_conselho ?? null,
        }));

        return {
            id: t.id,
            nome: t.nome,
            // Campos legados (compatibilidade) - usam o primeiro registro
            especialidade: primeiroRegistro?.area_atuacao?.nome,
            cargo: primeiroRegistro?.cargo?.nome,
            conselho: getSiglaConselho(primeiroRegistro?.area_atuacao?.nome),
            registroConselho: primeiroRegistro?.numero_conselho,
            // Novo: todos os registros profissionais
            dadosProfissionais,
        };
    });
}

export async function getTerapeutaLogado(userId: string): Promise<CabecalhoAta> {
    const res = await authFetch(`${atasConfig.apiBase}/atas-reuniao/terapeuta/${userId}`);
    if (!res.ok) throw new Error('Falha ao carregar dados do terapeuta');
    
    const t = await res.json();
    const registros = t.registro_profissional ?? [];
    const primeiroRegistro = registros[0];
    
    // Mapeia todos os registros profissionais
    const dadosProfissionais = registros.map((rp: any) => ({
        cargo: rp.cargo?.nome ?? '',
        areaAtuacao: rp.area_atuacao?.nome ?? '',
        numeroConselho: rp.numero_conselho ?? null,
    }));
    
    return {
        terapeutaId: t.id,
        terapeutaNome: t.nome,
        // Usa primeiro registro como padrão
        conselhoNumero: primeiroRegistro?.numero_conselho,
        conselhoTipo: getSiglaConselho(primeiroRegistro?.area_atuacao?.nome),
        profissao: primeiroRegistro?.area_atuacao?.nome,
        cargo: primeiroRegistro?.cargo?.nome,
        // Todos os registros para permitir seleção
        dadosProfissionais,
    };
}
