import type { Patient, Therapist, CreateProgramInput } from '../../../core/types';
import { FISIO_AREA_ID } from '../constants';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Serviços de API para Fisioterapia
 * 🔧 Usa FISIO_AREA_ID centralizado para garantir consistência
 */

export async function fetchFisioPatientById(id: string): Promise<Patient> {
    const response = await fetch(`${API_URL}/client/${id}`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Erro ao buscar cliente');
    }

    const data = await response.json();
    
    return {
        id: data.id,
        name: data.name,
        guardianName: data.guardianName,
        age: data.age,
        photoUrl: data.photoUrl,
    };
}

export async function fetchFisioTherapistById(id: string): Promise<Therapist> {
    const response = await fetch(`${API_URL}/therapist/${id}`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Erro ao buscar terapeuta');
    }

    const data = await response.json();
    
    return {
        id: data.id,
        name: data.name,
        photoUrl: data.photoUrl,
        especialidade: data.especialidade,
    };
}

export async function fetchFisioTherapistAvatar(therapistId: string): Promise<string | null> {
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

export async function createFisioProgram(input: CreateProgramInput): Promise<{ id: string }> {
    const response = await fetch(`${API_URL}/ocp/programs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            ...input,
            area: FISIO_AREA_ID, // 🔧 CORRIGIDO: Usa constante 'fisioterapia'
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar programa de Fisio');
    }

    return await response.json();
}

export async function listFisioPrograms(params: {
    patientId: string;
    q?: string;
    status?: 'active' | 'archived' | 'all';
    sort?: 'recent' | 'alphabetic';
    page?: number;
}): Promise<any[]> {
    const url = new URL(`${API_URL}/ocp/clients/${params.patientId}/programs`);
    
    // 🔧 CORRIGIDO: Usa filtro consistente com AreaContext
    // Backend filtra por especialidade do terapeuta usando label
    url.searchParams.set('area', 'Fisioterapia');
    
    if (params.page) url.searchParams.set('page', params.page.toString());
    if (params.status && params.status !== 'all') url.searchParams.set('status', params.status);
    if (params.q) url.searchParams.set('q', params.q);
    if (params.sort) url.searchParams.set('sort', params.sort);

    try {
        const response = await fetch(url.toString(), {
            credentials: 'include',
            headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar programas de TO');
        }

        const json = await response.json();
        const realPrograms = (json?.data ?? []);
        
        // MOCK: SEMPRE adicionar programa mockado para desenvolvimento
        // TODO: Remover quando o backend de Fisio estiver pronto
        const { mockToProgramListItem } = await import('../mocks/programListMock');
        console.log('🎭 Adicionando programa MOCK de Fisio para desenvolvimento');
        return [mockToProgramListItem, ...realPrograms];
    } catch (error) {
        console.error('Erro ao buscar programas de TO:', error);
        
        // Em caso de erro, retornar apenas o mock para desenvolvimento
        const { mockToProgramListItem } = await import('../mocks/programListMock');
        console.log('🎭 Retornando apenas programa MOCK de Fisio (erro na API)');
        return [mockToProgramListItem];
    }
}
