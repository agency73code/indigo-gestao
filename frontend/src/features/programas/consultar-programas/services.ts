import { fetchClients } from '../api';
import type { Patient, ProgramListItem } from './types';

export async function searchPatients(q: string): Promise<Patient[]> {
    return await fetchClients(q);
}

export async function listPrograms(params: {
    patientId: string;
    q?: string;
    status?: 'active' | 'archived' | 'all';
    sort?: 'recent' | 'alphabetic';
    page?: number;
}): Promise<ProgramListItem[]> {
    const url = new URL(`/api/ocp/clients/${params.patientId}/programs`, window.location.origin);
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

    const json = await res.json();
    return json.data;
}
