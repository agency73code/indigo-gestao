import { ageCalculation, buildApiUrl, fetchOwnerAvatar } from '@/lib/api';
import type { Patient, Therapist, CreateProgramInput } from '../../../core/types';
import { FISIO_AREA_ID } from '../constants';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Serviços de API para Fisioterapia
 * 🔧 Usa FISIO_AREA_ID centralizado para garantir consistência
 */

export async function fetchFisioPatientById(id: string): Promise<Patient> {
    const response = await fetch(`${API_URL}/clientes/${id}`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Erro ao buscar cliente');
    }

    const data = await response.json();
    const client = data.data;
    const photoUrl = await fetchOwnerAvatar(client.id, 'cliente');

    return {
        id: client.id,
        name: client.nome,
        guardianName: client.cuidadores[0].nome,
        age: ageCalculation(client.dataNascimento),
        photoUrl,
    };
}

export async function fetchFisioTherapistById(id: string): Promise<Therapist> {
    const response = await fetch(`${API_URL}/terapeutas/${id}`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Erro ao buscar terapeuta');
    }

    const data = await response.json();
    
    return {
        id: data.id,
        name: data.nome,
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
    const response = await fetch(`${API_URL}/ocp/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',

        body: JSON.stringify({
            ...input,
            area: FISIO_AREA_ID,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar programa de Fisio');
    }

    const result = await response.json();
    return { id: String(result.data?.id || result.id) };
}

export async function listFisioPrograms(params: {
    patientId: string;
    q?: string;
    status?: 'active' | 'archived' | 'all';
    sort?: 'recent' | 'alphabetic';
    page?: number;
}): Promise<any[]> {
    const teste = buildApiUrl(`/api/ocp/clients/${params.patientId}/programs`, {
        area: 'fisioterapia',
        page: params.page?.toString(),
        status: params.status !== 'all' ? params.status : undefined,
        q: params.q,
        sort: params.sort,
    });

    try {
        const response = await fetch(teste, {
            credentials: 'include',
            headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar programas de TO');
        }

        const json = await response.json();
        const realPrograms = (json?.data ?? []);

        return [...realPrograms];
    } catch (error) {
        console.error('Erro ao buscar programas de TO:', error);
        
        // Em caso de erro, retornar apenas o mock para desenvolvimento
        const { mockToProgramListItem } = await import('../mocks/programListMock');
        console.log('🎭 Retornando apenas programa MOCK de Fisio (erro na API)');
        return [mockToProgramListItem];
    }
}
