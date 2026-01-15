/**
 * Service para Prontuário Psicológico
 * 
 * Gerencia operações de API para prontuários e evoluções
 */

import { authFetch } from '@/lib/http';
import { listarClientes as listarClientesApi, listarTerapeutas as listarTerapeutasApi, buscarClientePorId } from '@/lib/api';
import type { Patient, Therapist } from '@/features/consultas/types/consultas.types';
import type { Cliente } from '@/features/cadastros/types/cadastros.types';
import type { 
    ProntuarioPsicologico,
    ProntuarioFormData,
    ProntuarioResponse,
    ProntuarioListResult,
    ProntuarioListFilters,
    EvolucaoTerapeutica,
    EvolucaoFormData,
    EvolucaoResponse,
    MembroNucleoFamiliar,
    TerapiaPrevia,
} from '../types';

// Mocks para desenvolvimento
import { mockProntuario, mockProntuariosList } from '../mock';

// ============================================
// CONFIGURAÇÃO
// ============================================

const ENDPOINT = '/prontuarios-psicologicos';
const USE_MOCK = true; // Alterar para false quando backend estiver pronto

// ============================================
// TIPOS AUXILIARES
// ============================================

export type ClienteResumido = Patient;
export type TerapeutaResumido = Therapist;
export type ClienteCompleto = Cliente;

// ============================================
// FUNÇÕES DE CLIENTES E TERAPEUTAS
// ============================================

/**
 * Buscar lista de clientes para o select
 */
export async function listarClientes(): Promise<ClienteResumido[]> {
    const result = await listarClientesApi();
    return result.items;
}

/**
 * Buscar cliente completo por ID (com cuidadores, endereço, etc)
 */
export async function buscarCliente(id: string): Promise<ClienteCompleto> {
    return buscarClientePorId(id);
}

/**
 * Buscar lista de terapeutas para o select
 */
export async function listarTerapeutas(): Promise<TerapeutaResumido[]> {
    const result = await listarTerapeutasApi();
    return result.items;
}

/**
 * Buscar anamnese do cliente para obter terapias prévias
 * Usa a listagem de anamneses filtrando pelo nome do cliente
 */
export async function buscarAnamneseDoCliente(clienteId: string, clienteNome: string): Promise<TerapiaPrevia[]> {
    try {
        // Buscar anamneses que contém o nome do cliente
        const res = await authFetch(`/api/anamneses?q=${encodeURIComponent(clienteNome)}&pageSize=50`, { 
            method: 'GET' 
        });
        
        if (!res.ok) return [];
        
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        
        if (!data?.items || data.items.length === 0) return [];
        
        // Encontrar a anamnese deste cliente
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anamneseDoCliente = data.items.find((a: any) => a.clienteId === clienteId);
        
        if (!anamneseDoCliente) return [];
        
        // Buscar detalhes completos da anamnese
        const resDetalhe = await authFetch(`/api/anamneses/${anamneseDoCliente.id}`, { 
            method: 'GET' 
        });
        
        if (!resDetalhe.ok) return [];
        
        const textDetalhe = await resDetalhe.text();
        const anamnese = textDetalhe ? JSON.parse(textDetalhe) : null;
        
        // Extrair terapias prévias
        const terapiasPrevias = anamnese?.normalized?.queixaDiagnostico?.terapiasPrevias 
            || anamnese?.queixaDiagnostico?.terapiasPrevias 
            || [];
        
        // Mapear para o formato do prontuário
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return terapiasPrevias.map((t: any) => ({
            id: t.id || String(Date.now()) + '-' + Math.random().toString(36).substr(2, 9),
            profissional: t.profissional || '',
            especialidadeAbordagem: t.especialidadeAbordagem || '',
            tempoIntervencao: t.tempoIntervencao || '',
            observacao: t.observacao || '',
            ativo: t.ativo ?? true,
            origemAnamnese: true,
        }));
    } catch (error) {
        console.error('Erro ao buscar anamnese do cliente:', error);
        return [];
    }
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Calcular idade a partir da data de nascimento
 */
export function calcularIdade(dataNascimento: string): string {
    if (!dataNascimento) return '';
    
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    
    let anos = hoje.getFullYear() - nascimento.getFullYear();
    let meses = hoje.getMonth() - nascimento.getMonth();
    
    if (meses < 0 || (meses === 0 && hoje.getDate() < nascimento.getDate())) {
        anos--;
        meses += 12;
    }
    
    if (hoje.getDate() < nascimento.getDate()) {
        meses--;
        if (meses < 0) meses = 11;
    }
    
    if (anos === 0) {
        return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    }
    
    if (meses === 0) {
        return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    }
    
    return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
}

/**
 * Formatar data para exibição (DD/MM/YYYY)
 */
export function formatarData(dataISO: string): string {
    if (!dataISO) return '';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
}

/**
 * Formatar endereço completo do cliente
 * O backend retorna estrutura aninhada: enderecos[0].endereco.rua
 * Mas o tipo espera estrutura flat: enderecos[0].logradouro
 * Esta função lida com ambos os casos
 */
export function formatarEndereco(cliente: ClienteCompleto): string {
    const enderecoItem = cliente.enderecos?.[0];
    if (!enderecoItem) return '';
    
    // Tentar pegar da estrutura aninhada (como vem do backend)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enderecoAninhado = (enderecoItem as any)?.endereco;
    
    // Extrair campos - primeiro tenta da estrutura aninhada, depois da flat
    const logradouro = enderecoAninhado?.rua || enderecoAninhado?.logradouro || enderecoItem.logradouro;
    const numero = enderecoAninhado?.numero || enderecoItem.numero;
    const complemento = enderecoAninhado?.complemento || enderecoItem.complemento;
    const bairro = enderecoAninhado?.bairro || enderecoItem.bairro;
    const cidade = enderecoAninhado?.cidade || enderecoItem.cidade;
    const uf = enderecoAninhado?.uf || enderecoItem.uf;
    
    if (!logradouro && !numero && !bairro && !cidade) {
        return '';
    }
    
    const partes: string[] = [];
    
    // Logradouro + número
    if (logradouro) {
        partes.push(numero ? `${logradouro}, ${numero}` : logradouro);
    }
    
    // Complemento
    if (complemento) {
        partes.push(complemento);
    }
    
    // Bairro
    if (bairro) {
        partes.push(bairro);
    }
    
    // Cidade - UF
    if (cidade && uf) {
        partes.push(`${cidade} - ${uf}`);
    } else if (cidade) {
        partes.push(cidade);
    } else if (uf) {
        partes.push(uf);
    }
    
    return partes.join(', ');
}

/**
 * Mapear cuidadores do cliente para núcleo familiar
 */
export function mapearNucleoFamiliar(cliente: ClienteCompleto): MembroNucleoFamiliar[] {
    if (!cliente.cuidadores) return [];
    
    return cliente.cuidadores.map((c: any) => ({
        id: String(c.id || ''),
        nome: c.nome || '',
        parentesco: c.relacao || c.descricaoRelacao || '',
        idade: c.dataNascimento ? calcularIdade(c.dataNascimento) : undefined,
        ocupacao: c.profissao || '',
    }));
}

// ============================================
// API - PRONTUÁRIOS
// ============================================

/**
 * Listar prontuários
 */
export async function listarProntuarios(
    filtros: ProntuarioListFilters = {}
): Promise<ProntuarioListResult> {
    if (USE_MOCK) {
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        let items = [...mockProntuariosList];
        
        // Aplicar filtro de busca
        if (filtros.q) {
            const termo = filtros.q.toLowerCase();
            items = items.filter(p => 
                p.clienteNome.toLowerCase().includes(termo) ||
                p.terapeutaNome.toLowerCase().includes(termo)
            );
        }
        
        // Aplicar filtro de status
        if (filtros.status && filtros.status !== 'todos') {
            items = items.filter(p => p.status === filtros.status);
        }
        
        const page = filtros.page || 1;
        const pageSize = filtros.pageSize || 10;
        const total = items.length;
        const totalPages = Math.ceil(total / pageSize);
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        
        return {
            items: items.slice(start, end),
            total,
            page,
            pageSize,
            totalPages,
        };
    }
    
    const params = new URLSearchParams();
    if (filtros.q) params.append('q', filtros.q);
    if (filtros.status) params.append('status', filtros.status);
    if (filtros.page) params.append('page', String(filtros.page));
    if (filtros.pageSize) params.append('pageSize', String(filtros.pageSize));
    
    const res = await authFetch(`/api${ENDPOINT}?${params.toString()}`);
    const json = await res.json();
    
    if (!res.ok) {
        throw new Error(json.message || 'Erro ao listar prontuários');
    }
    
    return json.data;
}

/**
 * Buscar prontuário por ID
 */
export async function buscarProntuario(id: string): Promise<ProntuarioPsicologico | null> {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (id === '1') return mockProntuario;
        return null;
    }
    
    const res = await authFetch(`/api${ENDPOINT}/${id}`);
    
    if (res.status === 404) return null;
    
    const json = await res.json();
    
    if (!res.ok) {
        throw new Error(json.message || 'Erro ao buscar prontuário');
    }
    
    return json.data;
}

/**
 * Buscar prontuário por ID do cliente
 */
export async function buscarProntuarioPorCliente(clienteId: string): Promise<ProntuarioPsicologico | null> {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (clienteId === 'client-001') return mockProntuario;
        return null;
    }
    
    const res = await authFetch(`/api${ENDPOINT}/cliente/${clienteId}`);
    
    if (res.status === 404) return null;
    
    const json = await res.json();
    
    if (!res.ok) {
        throw new Error(json.message || 'Erro ao buscar prontuário');
    }
    
    return json.data;
}

/**
 * Criar prontuário
 */
export async function criarProntuario(data: ProntuarioFormData): Promise<ProntuarioResponse> {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('[MOCK] Criando prontuário:', data);
        return {
            success: true,
            data: { ...mockProntuario, id: String(Date.now()) },
            message: 'Prontuário criado com sucesso',
        };
    }
    
    try {
        const res = await authFetch(`/api${ENDPOINT}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
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
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('[MOCK] Atualizando prontuário:', id, data);
        return {
            success: true,
            data: mockProntuario,
            message: 'Prontuário atualizado com sucesso',
        };
    }
    
    try {
        const res = await authFetch(`/api${ENDPOINT}/${id}`, {
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
// API - EVOLUÇÕES
// ============================================

/**
 * Criar nova evolução (sessão)
 */
export async function criarEvolucao(data: EvolucaoFormData): Promise<EvolucaoResponse> {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('[MOCK] Criando evolução:', data);
        
        const novaEvolucao: EvolucaoTerapeutica = {
            id: String(Date.now()),
            numeroSessao: mockProntuario.evolucoes.length + 1,
            dataEvolucao: data.dataEvolucao,
            descricaoSessao: data.descricaoSessao,
            arquivos: data.arquivos.filter(a => !a.removed),
            criadoEm: new Date().toISOString(),
        };
        
        return {
            success: true,
            data: novaEvolucao,
            message: 'Evolução registrada com sucesso',
        };
    }
    
    try {
        const fd = new FormData();
        fd.append('payload', JSON.stringify({
            prontuarioId: data.prontuarioId,
            dataEvolucao: data.dataEvolucao,
            descricaoSessao: data.descricaoSessao,
        }));
        
        // Adicionar arquivos
        for (const arquivo of data.arquivos) {
            if (arquivo.file && !arquivo.removed) {
                fd.append(`files[${arquivo.id}]`, arquivo.file, arquivo.file.name);
            }
        }
        
        const res = await authFetch(`/api${ENDPOINT}/${data.prontuarioId}/evolucoes`, {
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
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockProntuario.evolucoes;
    }
    
    const res = await authFetch(`/api${ENDPOINT}/${prontuarioId}/evolucoes`);
    const json = await res.json();
    
    if (!res.ok) {
        throw new Error(json.message || 'Erro ao listar evoluções');
    }
    
    return json.data;
}

/**
 * Buscar evolução por ID
 */
export async function buscarEvolucao(
    prontuarioId: string, 
    evolucaoId: string
): Promise<EvolucaoTerapeutica | null> {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockProntuario.evolucoes.find(e => e.id === evolucaoId) || null;
    }
    
    const res = await authFetch(`/api${ENDPOINT}/${prontuarioId}/evolucoes/${evolucaoId}`);
    
    if (res.status === 404) return null;
    
    const json = await res.json();
    
    if (!res.ok) {
        throw new Error(json.message || 'Erro ao buscar evolução');
    }
    
    return json.data;
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
