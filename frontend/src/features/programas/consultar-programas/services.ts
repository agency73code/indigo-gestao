import { fetchClients } from '../api';
import type { Patient, ProgramListItem } from './types';

// TODO: substituir por serviços reais da API
const USE_LOCAL_MOCKS = false;

export async function searchPatients(q: string): Promise<Patient[]> {
    if (USE_LOCAL_MOCKS) {
        const { mockPatients } = await import('./mocks/patients.mock');
        
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 200));
        
        return mockPatients.filter(patient =>
            patient.name.toLowerCase().includes(q.toLowerCase()) ||
            patient.guardianName?.toLowerCase().includes(q.toLowerCase())
        );
    }

    return await fetchClients(q);
}

export async function listPrograms(params: {
    patientId: string;
    q?: string;
    status?: 'active' | 'archived' | 'all';
    sort?: 'recent' | 'alphabetic';
    page?: number;
}): Promise<ProgramListItem[]> {
    if (USE_LOCAL_MOCKS) {
        const { mockPrograms } = await import('./mocks/programs.mock');
        
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 300));
        
        let programs = mockPrograms.filter(program => program.patientId === params.patientId);
        
        // Filtrar por texto de busca
        if (params.q) {
            programs = programs.filter(program =>
                program.title?.toLowerCase().includes(params.q!.toLowerCase()) ||
                program.objective?.toLowerCase().includes(params.q!.toLowerCase())
            );
        }
        
        // Filtrar por status
        if (params.status && params.status !== 'all') {
            programs = programs.filter(program => program.status === params.status);
        }
        
        // Ordenar
        programs.sort((a, b) => {
            if (params.sort === 'recent') {
                if (!a.lastSession && !b.lastSession) return 0;
                if (!a.lastSession) return 1;
                if (!b.lastSession) return -1;
                return new Date(b.lastSession).getTime() - new Date(a.lastSession).getTime();
            } else {
                return (a.title || '').localeCompare(b.title || '');
            }
        });
        
        return programs;
    }
    
    const url = new URL(`/api/ocp/clients/${params.patientId}/programs`, window.location.origin);
    if (params.page) url.searchParams.set('page', params.page.toString());

    const res = await fetch(`/api/ocp/clients/${params.patientId}/programs`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
    });
    
    if (!res.ok) throw new Error('Erro ao buscar programas');

    const json = await res.json();
    return (json?.data ?? []) as ProgramListItem[];
}
