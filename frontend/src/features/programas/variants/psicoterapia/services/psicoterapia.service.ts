/**
 * Service de API Real para Prontuário Psicológico
 * 
 * Este arquivo contém APENAS chamadas para API real.
 * Para mock, veja: mocks/psicoterapia.mock.ts
 * 
 * BACKEND ENDPOINTS:
 * - GET    /api/prontuarios-psicologicos          - Listar prontuários
 * - GET    /api/prontuarios-psicologicos/:id      - Buscar prontuário por ID
 * - GET    /api/prontuarios-psicologicos/cliente/:id - Buscar por cliente
 * - POST   /api/prontuarios-psicologicos          - Criar prontuário
 * - PATCH  /api/prontuarios-psicologicos/:id      - Atualizar prontuário
 * - POST   /api/prontuarios-psicologicos/:id/evolucoes - Criar evolução
 * - GET    /api/prontuarios-psicologicos/:id/evolucoes - Listar evoluções
 */

import { authFetch } from '@/lib/http';
import type { 
    ProntuarioPsicologico,
    ProntuarioFormData,
    ProntuarioResponse,
    ProntuarioListResult,
    ProntuarioListFilters,
    ProntuarioListItem,
    EvolucaoTerapeutica,
    EvolucaoFormData,
    EvolucaoResponse,
    MembroNucleoFamiliar,
    TerapiaPrevia,
    ArquivoEvolucao,
} from '../types';
import type {
    ApiProntuarioPsicologico,
    ApiProntuarioListItem,
    ApiEvolucaoTerapeutica,
    ApiMembroNucleoFamiliar,
    ApiTerapiaPrevia,
    ApiArquivoEvolucao,
} from './psicoterapia.api-contract';
import { validateFile } from './psicoterapia.api-contract';
import { psicoterapiaServiceConfig } from './psicoterapia.config';

const { endpoints } = psicoterapiaServiceConfig;

// ============================================
// MAPPERS: API (snake_case) → Frontend (camelCase)
// ============================================

function mapMembroFamiliarFromApi(api: ApiMembroNucleoFamiliar): MembroNucleoFamiliar {
    return {
        id: api.id,
        nome: api.nome,
        cpf: api.cpf,
        parentesco: api.parentesco,
        descricaoRelacao: api.descricao_relacao,
        dataNascimento: api.data_nascimento,
        idade: api.idade,
        ocupacao: api.ocupacao,
        origemBanco: api.origem_banco,
    };
}

function mapTerapiaPreviaFromApi(api: ApiTerapiaPrevia): TerapiaPrevia {
    return {
        id: api.id,
        profissional: api.profissional,
        especialidadeAbordagem: api.especialidade_abordagem,
        tempoIntervencao: api.tempo_intervencao,
        observacao: api.observacao,
        ativo: api.ativo,
        origemAnamnese: api.origem_anamnese,
    };
}

function mapArquivoFromApi(api: ApiArquivoEvolucao): ArquivoEvolucao {
    return {
        id: api.id,
        nome: api.nome,
        tipo: api.tipo,
        mimeType: api.mime_type,
        tamanho: api.tamanho,
        url: api.url,
        caminho: api.caminho,
        arquivoId: api.arquivo_id,
    };
}

function mapEvolucaoFromApi(api: ApiEvolucaoTerapeutica): EvolucaoTerapeutica {
    return {
        id: api.id,
        numeroSessao: api.numero_sessao,
        dataEvolucao: api.data_evolucao,
        descricaoSessao: api.descricao_sessao,
        arquivos: (api.arquivos || []).map(mapArquivoFromApi),
        criadoEm: api.criado_em,
        atualizadoEm: api.atualizado_em,
    };
}

function mapProntuarioListItemFromApi(api: ApiProntuarioListItem): ProntuarioListItem {
    return {
        id: api.id,
        clienteId: api.cliente_id,
        clienteNome: api.cliente_nome,
        clienteIdade: api.cliente_idade,
        terapeutaNome: api.terapeuta_nome,
        terapeutaCrp: api.terapeuta_crp,
        totalEvolucoes: api.total_evolucoes,
        ultimaEvolucao: api.ultima_evolucao,
        status: api.status,
        criadoEm: api.criado_em,
    };
}

function mapProntuarioFromApi(api: ApiProntuarioPsicologico): ProntuarioPsicologico {
    return {
        id: api.id,
        clienteId: api.cliente_id,
        terapeutaId: api.terapeuta_id,
        cliente: api.cliente ? {
            id: api.cliente.id,
            nome: api.cliente.nome,
            dataNascimento: api.cliente.data_nascimento,
            idade: '', // Calculado no frontend
            genero: api.cliente.genero,
            fotoUrl: api.cliente.foto_url,
        } : undefined,
        terapeuta: api.terapeuta ? {
            id: api.terapeuta.id,
            nome: api.terapeuta.nome,
            crp: api.terapeuta.crp,
            fotoUrl: api.terapeuta.foto_url,
        } : undefined,
        informacoesEducacionais: {
            nivelEscolaridade: api.informacoes_educacionais?.nivel_escolaridade || '',
            instituicaoFormacao: api.informacoes_educacionais?.instituicao_formacao || '',
            profissaoOcupacao: api.informacoes_educacionais?.profissao_ocupacao || '',
            observacoes: api.informacoes_educacionais?.observacoes || '',
        },
        nucleoFamiliar: (api.nucleo_familiar || []).map(mapMembroFamiliarFromApi),
        observacoesNucleoFamiliar: api.observacoes_nucleo_familiar || '',
        avaliacaoDemanda: {
            encaminhadoPor: api.avaliacao_demanda?.encaminhado_por || '',
            motivoBuscaAtendimento: api.avaliacao_demanda?.motivo_busca_atendimento || '',
            atendimentosAnteriores: api.avaliacao_demanda?.atendimentos_anteriores || '',
            observacoes: api.avaliacao_demanda?.observacoes || '',
            terapiasPrevias: (api.avaliacao_demanda?.terapias_previas || []).map(mapTerapiaPreviaFromApi),
        },
        objetivosTrabalho: api.objetivos_trabalho || '',
        avaliacaoAtendimento: api.avaliacao_atendimento || '',
        evolucoes: (api.evolucoes || []).map(mapEvolucaoFromApi),
        status: api.status,
        criadoEm: api.criado_em,
        atualizadoEm: api.atualizado_em,
    };
}

// ============================================
// MAPPERS: Frontend (camelCase) → API (snake_case)
// ============================================

function mapProntuarioToApi(data: ProntuarioFormData) {
    return {
        cliente_id: data.clienteId,
        terapeuta_id: data.terapeutaId,
        informacoes_educacionais: {
            nivel_escolaridade: data.nivelEscolaridade,
            instituicao_formacao: data.instituicaoFormacao,
            profissao_ocupacao: data.profissaoOcupacao,
            observacoes: data.observacoesEducacao,
        },
        nucleo_familiar: data.nucleoFamiliar.map(m => ({
            id: m.id,
            nome: m.nome,
            cpf: m.cpf,
            parentesco: m.parentesco,
            descricao_relacao: m.descricaoRelacao,
            data_nascimento: m.dataNascimento,
            idade: m.idade,
            ocupacao: m.ocupacao,
            origem_banco: m.origemBanco,
        })),
        observacoes_nucleo_familiar: data.observacoesNucleoFamiliar,
        avaliacao_demanda: {
            encaminhado_por: data.encaminhadoPor,
            motivo_busca_atendimento: data.motivoBuscaAtendimento,
            atendimentos_anteriores: data.atendimentosAnteriores,
            observacoes: data.observacoesAvaliacao,
            terapias_previas: data.terapiasPrevias.map(t => ({
                id: t.id,
                profissional: t.profissional,
                especialidade_abordagem: t.especialidadeAbordagem,
                tempo_intervencao: t.tempoIntervencao,
                observacao: t.observacao,
                ativo: t.ativo,
                origem_anamnese: t.origemAnamnese,
            })),
        },
        objetivos_trabalho: data.objetivosTrabalho,
        avaliacao_atendimento: data.avaliacaoAtendimento,
    };
}

// ============================================
// HELPERS
// ============================================

/** Monta query string a partir de filtros */
function buildQueryString(filtros?: ProntuarioListFilters): string {
    if (!filtros) return '';
    
    const params = new URLSearchParams();
    if (filtros.q) params.append('q', filtros.q);
    if (filtros.status && filtros.status !== 'todos') {
        params.append('status', filtros.status);
    }
    if (filtros.page) params.append('page', String(filtros.page));
    if (filtros.pageSize) params.append('page_size', String(filtros.pageSize));
    
    const qs = params.toString();
    return qs ? `?${qs}` : '';
}

// ============================================
// PRONTUÁRIOS - API REAL
// ============================================

/**
 * Listar prontuários
 */
export async function listarProntuarios(
    filtros: ProntuarioListFilters = {}
): Promise<ProntuarioListResult> {
    const res = await authFetch(`${endpoints.prontuarios}${buildQueryString(filtros)}`);
    
    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || 'Erro ao listar prontuários');
    }
    
    const json = await res.json();
    
    // Mapear resposta da API (itens resumidos)
    const data = json.data || json;
    return {
        items: (data.items || []).map(mapProntuarioListItemFromApi),
        total: data.total ?? 0,
        page: data.page ?? 1,
        pageSize: data.page_size ?? data.pageSize ?? 10,
        totalPages: data.total_pages ?? data.totalPages ?? 1,
    };
}

/**
 * Buscar prontuário por ID
 */
export async function buscarProntuario(id: string): Promise<ProntuarioPsicologico | null> {
    const res = await authFetch(`${endpoints.prontuarios}/${id}`);
    
    if (res.status === 404) return null;
    
    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || 'Erro ao buscar prontuário');
    }
    
    const json = await res.json();
    const apiData = json.data || json;
    return mapProntuarioFromApi(apiData);
}

/**
 * Buscar prontuário por ID do cliente [feito]
 */
export async function buscarProntuarioPorCliente(clienteId: string): Promise<ProntuarioPsicologico | null> {
    const res = await authFetch(endpoints.porCliente(clienteId));
    
    if (res.status === 404) return null;
    
    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || 'Erro ao buscar prontuário');
    }
    
    const json = await res.json();
    const apiData = json.data || json;
    return mapProntuarioFromApi(apiData);
}

/**
 * Criar prontuário [feito]
 */
export async function criarProntuario(data: ProntuarioFormData): Promise<ProntuarioResponse> {
    try {
        const payload = mapProntuarioToApi(data);

        const res = await authFetch(endpoints.prontuarios, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        
        const json = await res.json();
        
        if (!res.ok) {
            return {
                success: false,
                message: json.message || 'Erro ao criar prontuário',
                errors: json.errors,
            };
        }
        
        return {
            success: true,
            data: json.data,
            message: 'Prontuário criado com sucesso',
        };
    } catch (error) {
        console.error('[API] Erro ao criar prontuário:', error);
        return {
            success: false,
            message: 'Erro de conexão ao criar prontuário',
        };
    }
}

/**
 * Atualizar prontuário
 */
export async function atualizarProntuario(
    id: string, 
    data: Partial<ProntuarioFormData>
): Promise<ProntuarioResponse> {
    try {
        const res = await authFetch(`${endpoints.prontuarios}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        
        const json = await res.json();
        
        if (!res.ok) {
            return {
                success: false,
                message: json.message || 'Erro ao atualizar prontuário',
                errors: json.errors,
            };
        }
        
        return {
            success: true,
            data: json.data,
            message: 'Prontuário atualizado com sucesso',
        };
    } catch (error) {
        console.error('[API] Erro ao atualizar prontuário:', error);
        return {
            success: false,
            message: 'Erro de conexão ao atualizar prontuário',
        };
    }
}

// ============================================
// EVOLUÇÕES - API REAL
// ============================================

/**
 * Criar nova evolução (sessão)
 */
export async function criarEvolucao(data: EvolucaoFormData): Promise<EvolucaoResponse> {
    try {
        const fd = new FormData();
        fd.append('payload', JSON.stringify({
            prontuario_id: data.prontuarioId,
            data_evolucao: data.dataEvolucao,
            descricao_sessao: data.descricaoSessao,
        }));
        
        // Adicionar arquivos com validação
        for (const arquivo of data.arquivos) {
            if (arquivo.file && !arquivo.removed) {
                // Validar arquivo antes de enviar
                const validation = validateFile(arquivo.file);
                if (!validation.valid) {
                    return {
                        success: false,
                        message: validation.error || 'Arquivo inválido',
                    };
                }
                fd.append(`files[${arquivo.id}]`, arquivo.file, arquivo.file.name);
                fd.append(`fileNames[${arquivo.id}]`, arquivo.nome);
            }
        }
        
        const res = await authFetch(endpoints.evolucoes(data.prontuarioId), {
            method: 'POST',
            body: fd,
        });
        
        const json = await res.json();
        
        if (!res.ok) {
            return {
                success: false,
                message: json.message || 'Erro ao registrar evolução',
                errors: json.errors,
            };
        }
        
        return {
            success: true,
            data: json.data,
            message: 'Evolução registrada com sucesso',
        };
    } catch (error) {
        console.error('[API] Erro ao criar evolução:', error);
        return {
            success: false,
            message: 'Erro de conexão ao registrar evolução',
        };
    }
}

/**
 * Listar evoluções de um prontuário
 */
export async function listarEvolucoes(prontuarioId: string): Promise<EvolucaoTerapeutica[]> {
    const res = await authFetch(endpoints.evolucoes(prontuarioId));
    
    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || 'Erro ao listar evoluções');
    }
    
    const json = await res.json();
    const items = json.data || json || [];
    return items.map(mapEvolucaoFromApi);
}

/**
 * Buscar evolução por ID
 */
export async function buscarEvolucao(
    prontuarioId: string, 
    evolucaoId: string
): Promise<EvolucaoTerapeutica | null> {
    const res = await authFetch(`${endpoints.evolucoes(prontuarioId)}/${evolucaoId}`);
    
    if (res.status === 404) return null;
    
    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || 'Erro ao buscar evolução');
    }
    
    const json = await res.json();
    const apiData = json.data || json;
    return mapEvolucaoFromApi(apiData);
}

// ============================================
// VERIFICAÇÕES
// ============================================

/**
 * Verificar se cliente já possui prontuário
 */
export async function verificarProntuarioExistente(clienteId: string): Promise<boolean> {
    const prontuario = await buscarProntuarioPorCliente(clienteId);
    return prontuario !== null;
}

/**
 * Atualizar evolução existente
 */
export async function atualizarEvolucao(
    prontuarioId: string,
    evolucaoId: string,
    data: Partial<EvolucaoFormData>
): Promise<EvolucaoResponse> {
    try {
        const fd = new FormData();
        
        // Payload com dados da evolução
        const payload: Record<string, unknown> = {};
        if (data.dataEvolucao) payload.data_evolucao = data.dataEvolucao;
        if (data.descricaoSessao) payload.descricao_sessao = data.descricaoSessao;
        
        fd.append('payload', JSON.stringify(payload));
        
        // Adicionar novos arquivos
        if (data.arquivos) {
            for (const arquivo of data.arquivos) {
                // Validar arquivo antes de enviar
                if (arquivo.file && !arquivo.removed) {
                    const validation = validateFile(arquivo.file);
                    if (!validation.valid) {
                        return {
                            success: false,
                            message: validation.error || 'Arquivo inválido',
                        };
                    }
                    fd.append(`files[${arquivo.id}]`, arquivo.file, arquivo.file.name);
                    fd.append(`fileNames[${arquivo.id}]`, arquivo.nome);
                }
                
                // Marcar arquivos para remoção
                if (arquivo.removed && arquivo.arquivoId) {
                    fd.append('removeFiles[]', arquivo.arquivoId);
                }
            }
        }
        
        const res = await authFetch(`${endpoints.evolucoes(prontuarioId)}/${evolucaoId}`, {
            method: 'PATCH',
            body: fd,
        });
        
        const json = await res.json();
        
        if (!res.ok) {
            return {
                success: false,
                message: json.message || 'Erro ao atualizar evolução',
                errors: json.errors,
            };
        }
        
        return {
            success: true,
            data: mapEvolucaoFromApi(json.data || json),
            message: 'Evolução atualizada com sucesso',
        };
    } catch (error) {
        console.error('[API] Erro ao atualizar evolução:', error);
        return {
            success: false,
            message: 'Erro de conexão ao atualizar evolução',
        };
    }
}

/**
 * Deletar evolução
 */
export async function deletarEvolucao(
    prontuarioId: string,
    evolucaoId: string
): Promise<{ success: boolean; message: string }> {
    try {
        const res = await authFetch(`${endpoints.evolucoes(prontuarioId)}/${evolucaoId}`, {
            method: 'DELETE',
        });
        
        if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            return {
                success: false,
                message: json.message || 'Erro ao deletar evolução',
            };
        }
        
        return {
            success: true,
            message: 'Evolução deletada com sucesso',
        };
    } catch (error) {
        console.error('[API] Erro ao deletar evolução:', error);
        return {
            success: false,
            message: 'Erro de conexão ao deletar evolução',
        };
    }
}
