/**
 * API Service para Musicoterapia
 * Chamadas para o backend real
 */

import type { Patient, Therapist, CreateProgramInput } from '../../../core/types';
import { MUSI_AREA_ID } from '../constants';
import type { ProgramDetail } from '../../../nova-sessao/types';
import type { MusiSessionPayload, MusiSessionResponse, MusiSessionListItem, MusiSessionDetail } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

function ageCalculation(isoDateString: string): number {
    const hoje = new Date();
    const nascimento = new Date(isoDateString);

    let idade = hoje.getFullYear() - nascimento.getFullYear();

    const mes = hoje.getMonth() - nascimento.getMonth();
    const dia = hoje.getDate() - nascimento.getDate();

    if (mes < 0 || (mes === 0 && dia < 0)) {
        idade--;
    }

    return idade;
}

export async function fetchMusiPatientById(id: string): Promise<Patient> {
    const response = await fetch(`${API_URL}/clientes/${id}`, {
        credentials: 'include',
    });
    
    if (!response.ok) {
        throw new Error('Erro ao buscar cliente');
    }
    
    const data = await response.json();
    const client = data.data;
    const photoUrl = await fetchMusiClientAvatar(client.id);

    return {
        id: client.id,
        name: client.nome,
        guardianName: client.cuidadores?.[0]?.nome || '',
        age: ageCalculation(client.dataNascimento),
        photoUrl,
    };
}

export async function fetchMusiClientAvatar(clientId: string): Promise<string | null> {
    try {
        const response = await fetch(
            `${API_URL}/arquivos/getAvatar?ownerId=${clientId}&ownerType=cliente`,
            { credentials: 'include' }
        );
        
        if (!response.ok) return null;
        
        const data = await response.json();
        return data.avatarUrl ?? null;
    } catch (error) {
        console.error('Erro ao buscar avatar:', error);
        return null;
    }
}

export async function fetchMusiTherapistById(id: string): Promise<Therapist> {
    const response = await fetch(`${API_URL}/terapeutas/${id}`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Erro ao buscar terapeuta');
    }

    const data = await response.json();
    const photoUrl = await fetchMusiTherapistAvatar(id);

    return {
        id,
        name: data.nome,
        photoUrl,
        especialidade: data.dadosProfissionais?.[0]?.areaAtuacao || 'Musicoterapia',
    };
}

export async function fetchMusiTherapistAvatar(therapistId: string): Promise<string | null> {
    try {
        const response = await fetch(
            `${API_URL}/arquivos/getAvatar?ownerId=${therapistId}&ownerType=terapeuta`,
            { credentials: 'include' }
        );
        
        if (!response.ok) return null;
        
        const data = await response.json();
        return data.avatarUrl ?? null;
    } catch (error) {
        console.error('Erro ao buscar avatar:', error);
        return null;
    }
}

export async function createMusiProgram(input: CreateProgramInput): Promise<{ id: string }> {
    // Transforma stimuli para o formato esperado pela API
    const stimuliForApi = input.stimuli?.map((s, index) => ({
        id: s.id || crypto.randomUUID(),
        order: index,
        label: s.label,
        description: s.description || null,
        active: true,
    })) || [];

    const response = await fetch(`${API_URL}/ocp/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            ...input,
            stimuli: stimuliForApi,
            area: MUSI_AREA_ID,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar programa de Musicoterapia');
    }

    const result = await response.json();
    return { id: String(result.id) };
}

export async function listMusiPrograms(params: {
    patientId: string;
    q?: string;
    status?: 'active' | 'archived' | 'all';
    sort?: 'recent' | 'alphabetic';
    page?: number;
}): Promise<any[]> {
    console.log('🎵 [listMusiPrograms] Chamado com params:', params);
    
    const url = new URL(`${API_URL}/ocp/clients/${params.patientId}/programs`);
    
    url.searchParams.set('area', MUSI_AREA_ID);
    
    if (params.page) url.searchParams.set('page', params.page.toString());
    if (params.status && params.status !== 'all') url.searchParams.set('status', params.status);
    if (params.q) url.searchParams.set('q', params.q);
    if (params.sort) url.searchParams.set('sort', params.sort);

    console.log('🎵 [listMusiPrograms] URL da API:', url.toString());

    try {
        const response = await fetch(url.toString(), {
            credentials: 'include',
            headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const json = await response.json();
        const realPrograms = (json?.data ?? []);
        
        console.log('✅ [API] Retornando', realPrograms.length, 'programas de Musicoterapia da API');
        
        // Se a API não retornar programas, usar mocks para desenvolvimento
        if (realPrograms.length === 0) {
            console.log('📦 [API] Nenhum programa encontrado na API, carregando mocks...');
            
            const { mockMusiProgramList } = await import('../mocks/programListMock');
            let result = [...mockMusiProgramList];
            
            console.log('📦 [MOCK] Total de programas no mock:', result.length);
            
            // Aplicar apenas filtros de status e query (ignorar patientId em desenvolvimento)
            if (params.status && params.status !== 'all') {
                result = result.filter(p => p.status === params.status);
                console.log('🔍 [MOCK] Após filtro de status:', result.length, 'programas');
            }
            
            if (params.q) {
                const query = params.q.toLowerCase();
                result = result.filter(p => 
                    (p.title?.toLowerCase() || '').includes(query) ||
                    (p.objective?.toLowerCase() || '').includes(query) ||
                    (p.patientName?.toLowerCase() || '').includes(query)
                );
                console.log('🔍 [MOCK] Após filtro de busca:', result.length, 'programas');
            }
            
            console.log('✅ [MOCK] Retornando', result.length, 'programas de Musicoterapia');
            console.log('📋 [MOCK] Programas:', result.map(p => ({ id: p.id, title: p.title })));
            return result;
        }
        
        return realPrograms;
    } catch (error) {
        console.error('❌ [API] Erro ao buscar programas de Musicoterapia:', error);
        console.log('🔄 [MOCK] Carregando dados mock...');
        
        // Retornar mocks em caso de erro
        const { mockMusiProgramList } = await import('../mocks/programListMock');
        let result = [...mockMusiProgramList];
        
        console.log('📦 [MOCK] Total de programas no mock:', result.length);
        
        // TEMPORÁRIO: Aceitar qualquer patientId para desenvolvimento
        // O mock sempre retorna programas, independente do patientId
        console.log('🎵 [MOCK] Retornando todos os programas mock (ignorando patientId para desenvolvimento)');
        
        // Aplicar apenas filtros de status e query
        if (params.status && params.status !== 'all') {
            result = result.filter(p => p.status === params.status);
            console.log('🔍 [MOCK] Após filtro de status:', result.length, 'programas');
        }
        
        if (params.q) {
            const query = params.q.toLowerCase();
            result = result.filter(p => 
                (p.title?.toLowerCase() || '').includes(query) ||
                (p.objective?.toLowerCase() || '').includes(query) ||
                (p.patientName?.toLowerCase() || '').includes(query)
            );
            console.log('🔍 [MOCK] Após filtro de busca:', result.length, 'programas');
        }
        
        console.log('✅ [MOCK] Retornando', result.length, 'programas de Musicoterapia');
        console.log('📋 [MOCK] Programas:', result.map(p => ({ id: p.id, title: p.title })));
        return result;
    }
}

/**
 * Busca programa de Musicoterapia por ID
 */
export async function fetchMusiProgram(id: string): Promise<ProgramDetail> {
    const response = await fetch(`${API_URL}/ocp/${id}?area=${MUSI_AREA_ID}`, {
        credentials: 'include',
    });
    
    if (!response.ok) {
        throw new Error('Erro ao buscar programa de Musicoterapia');
    }
    
    return response.json();
}

/**
 * Atualiza programa de Musicoterapia
 */
export async function updateMusiProgram(id: string, data: Partial<ProgramDetail>): Promise<ProgramDetail> {
    const response = await fetch(`${API_URL}/ocp/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...data, area: MUSI_AREA_ID }),
    });
    
    if (!response.ok) {
        throw new Error('Erro ao atualizar programa de Musicoterapia');
    }
    
    return response.json();
}

/**
 * Salva sessão de Musicoterapia
 */
export async function saveMusiSession(payload: MusiSessionPayload): Promise<MusiSessionResponse> {
    const response = await fetch(`${API_URL}/sessoes/musicoterapia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Erro ao salvar sessão de Musicoterapia');
    }
    
    return response.json();
}

/**
 * Lista sessões de Musicoterapia
 */
export async function fetchMusiSessions(filters?: {
    patientId?: string;
    programId?: string;
    startDate?: string;
    endDate?: string;
}): Promise<MusiSessionListItem[]> {
    const params = new URLSearchParams({ area: MUSI_AREA_ID });
    
    if (filters?.patientId) params.append('clienteId', filters.patientId);
    if (filters?.programId) params.append('programaId', filters.programId);
    if (filters?.startDate) params.append('dataInicio', filters.startDate);
    if (filters?.endDate) params.append('dataFim', filters.endDate);
    
    const response = await fetch(`${API_URL}/sessoes?${params.toString()}`, {
        credentials: 'include',
    });
    
    if (!response.ok) {
        throw new Error('Erro ao listar sessões de Musicoterapia');
    }
    
    return response.json();
}

/**
 * Busca detalhe de sessão de Musicoterapia
 */
export async function fetchMusiSessionById(id: string): Promise<MusiSessionDetail> {
    const response = await fetch(`${API_URL}/sessoes/${id}?area=${MUSI_AREA_ID}`, {
        credentials: 'include',
    });
    
    if (!response.ok) {
        throw new Error('Erro ao buscar sessão de Musicoterapia');
    }
    
    return response.json();
}
