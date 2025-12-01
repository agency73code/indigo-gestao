import type { Patient, Therapist, CreateProgramInput } from '../../../core/types';
import { TO_AREA_ID } from '../constants';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Serviços de API para Terapia Ocupacional
 * 🔧 Usa TO_AREA_ID centralizado para garantir consistência
 */

export async function fetchToPatientById(id: string): Promise<Patient> {
    const response = await fetch(`${API_URL}/clientes/${id}`, {
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

export async function fetchToTherapistById(id: string): Promise<Therapist> {
    const response = await fetch(`${API_URL}/terapeutas/${id}`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Erro ao buscar terapeuta');
    }

    const data = await response.json();
    
    return {
        id,
        name: data.nome, // Backend retorna 'nome' em português
        photoUrl: data.photoUrl,
        especialidade: data.especialidade,
    };
}

export async function fetchToTherapistAvatar(therapistId: string): Promise<string | null> {
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

export async function createToProgram(input: CreateProgramInput): Promise<{ id: string }> {
    const response = await fetch(`${API_URL}/ocp/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            ...input,
            area: TO_AREA_ID,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar programa de TO');
    }

    const result = await response.json();
    return { id: String(result.id) };
}

export async function listToPrograms(params: {
    patientId: string;
    q?: string;
    status?: 'active' | 'archived' | 'all';
    sort?: 'recent' | 'alphabetic';
    page?: number;
}): Promise<any[]> {
    const url = new URL(`${API_URL}/ocp/clients/${params.patientId}/programs`);
    
    // 🔧 CORRIGIDO: Usa filtro consistente com AreaContext
    // Backend filtra por especialidade do terapeuta usando label
    url.searchParams.set('area', 'terapia-ocupacional');
    
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
        
        return realPrograms;
    } catch (error) {
        console.error('Erro ao buscar programas de TO:', error);
        return [];
    }
}
