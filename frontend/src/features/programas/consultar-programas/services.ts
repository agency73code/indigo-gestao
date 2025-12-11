import { fetchClients } from '../api';
import type { Patient, ProgramListItem } from './types';
import { getCurrentAreaFromStorage } from '@/utils/apiWithArea';

export async function searchPatients(q: string): Promise<Patient[]> {
    return await fetchClients(q);
}

/**
 * Retorna a área atual do contexto, com fallback para 'fonoaudiologia'
 */
function getArea(): string {
    return getCurrentAreaFromStorage() || 'fonoaudiologia';
}

export async function listPrograms(params: {
    patientId: string;
    q?: string;
    status?: 'active' | 'archived' | 'all';
    sort?: 'recent' | 'alphabetic';
    page?: number;
}): Promise<ProgramListItem[]> {
    const area = getArea();
    const url = new URL(`/api/ocp/clients/${params.patientId}/programs`, window.location.origin);

    url.searchParams.set('area', area);
    
    if (params.page) url.searchParams.set('page', params.page.toString());
    if (params.status) url.searchParams.set('status', params.status);
    if (params.q) url.searchParams.set('q', params.q);
    if (params.sort) url.searchParams.set('sort', params.sort);

    const res = await fetch(url.toString(), {
        credentials: 'include',
        headers: { Accept: 'application/json' },
    });

    if (!res.ok) throw new Error('Erro ao buscar programas');
    const json = await res.json();
    return (json?.data ?? []) as ProgramListItem[];
}

export async function getPatientById(patientId: string): Promise<Patient | null> {
    const res = await fetch(`/api/ocp/clients/${patientId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ao buscar paciente (${res.status}): ${text}`);
    }

    const json = await res.json();
    const data = json.data;

    if (!data) return null;

    try {
        // 🔄 mesma chamada que o fetchClients faz
        const avatarRes = await fetch(
            `${import.meta.env.VITE_API_URL}/arquivos/getAvatar?ownerId=${data.id}&ownerType=cliente`,
            { credentials: 'include' }
        );

        const avatarData = await avatarRes.json();

        return {
            ...data,
            photoUrl: avatarData.avatarUrl ?? null,
        };
    } catch {
        return { ...data, photoUrl: null };
    }
}
