import { ageCalculation, buildApiUrl, fetchOwnerAvatar } from '@/lib/api';
import type { Patient, Therapist, CreateProgramInput } from '../../../core/types';
import { getCurrentAreaFromStorage } from '@/utils/apiWithArea';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Serviços de API para o modelo Fisioterapia (Fisioterapia, Psicomotricidade, Educação Física)
 * 
 * IMPORTANTE: Estes serviços são compartilhados por áreas que usam o mesmo modelo:
 * - Fisioterapia
 * - Psicomotricidade
 * - Educação Física
 * 
 * A área é obtida automaticamente do contexto (localStorage) para garantir
 * que os dados sejam salvos e filtrados pela área correta.
 */

/**
 * Retorna a área atual do contexto, com fallback para 'fisioterapia'
 */
function getArea(): string {
    return getCurrentAreaFromStorage() || 'fisioterapia';
}

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
    const area = getArea();
    
    const response = await fetch(`${API_URL}/ocp/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            ...input,
            area,
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
    const area = getArea();
    const teste = buildApiUrl(`/api/ocp/clients/${params.patientId}/programs`, {
        area,
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
            throw new Error(`Erro ao buscar programas de ${area}`);
        }

        const json = await response.json();
        const realPrograms = (json?.data ?? []);

        return [...realPrograms];
    } catch (error) {
        console.error(`Erro ao buscar programas de ${area}:`, error);
        
        // Em caso de erro, retornar apenas o mock para desenvolvimento
        const { mockToProgramListItem } = await import('../mocks/programListMock');
        console.log(`🎭 Retornando apenas programa MOCK de ${area} (erro na API)`);
        return [mockToProgramListItem];
    }
}
