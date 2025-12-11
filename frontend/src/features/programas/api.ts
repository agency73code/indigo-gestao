import type { ProgramDetail } from './detalhe-ocp/types';
import { fetchWithArea, addAreaToUrl, getCurrentAreaFromStorage } from '@/utils/apiWithArea';

type Patient = {
    id: string;
    name: string;
    guardianName?: string;
    age?: number;
    birthDate?: string | null;
    photoUrl?: string | null;
};

type Therapist = {
    id: string;
    name: string;
    photoUrl?: string | null;
};

function ageCalc(birthDate: string) {
    return new Date().getFullYear() - new Date(birthDate).getFullYear();
}

export async function fetchProgram(programId: string): Promise<ProgramDetail> {
    // 🎵 Se for um ID mockado, retornar dados do mock
    if (programId.startsWith('mock-')) {
        console.log('📦 [MOCK] Detectado ID mockado, carregando do mock:', programId);
        const area = getCurrentAreaFromStorage();
        
        if (area === 'musicoterapia') {
            const { mockMusiProgram } = await import('./variants/musicoterapia/mocks/programMock');
            // mockMusiProgram é um objeto único, não um array
            if (mockMusiProgram.id === programId) {
                console.log('✅ [MOCK] Programa encontrado:', mockMusiProgram);
                return mockMusiProgram as ProgramDetail;
            }
        }
        
        throw new Error(`Mock não encontrado para ID: ${programId}`);
    }
    
    const res = await fetchWithArea(`/api/ocp/programs/${programId}`, { 
        credentials: 'include' 
    });
    if (!res.ok) throw new Error(`Erro ao buscar programas: ${res.statusText}`);

    const json = await res.json();
    const program = json.data as ProgramDetail;
    
    // Buscar avatar do cliente
    try {
        const clientAvatarRes = await fetch(`${import.meta.env.VITE_API_URL}/arquivos/getAvatar?ownerId=${program.patientId}&ownerType=cliente`, {
            credentials: 'include',
        });
        const clientAvatarData = await clientAvatarRes.json();
        program.patientPhotoUrl = clientAvatarData.avatarUrl ?? null;
    } catch {
        program.patientPhotoUrl = null;
    }
    
    // Buscar avatar do terapeuta
    try {
        const avatarRes = await fetch(`${import.meta.env.VITE_API_URL}/arquivos/getAvatar?ownerId=${program.therapistId}&ownerType=terapeuta`, {
            credentials: 'include',
        });
        const avatarData = await avatarRes.json();
        program.therapistPhotoUrl = avatarData.avatarUrl ?? null;
    } catch {
        program.therapistPhotoUrl = null;
    }

    return program;
}

export async function fetchClients(q?: string): Promise<Patient[]> {
    const area = getCurrentAreaFromStorage();
    let url = q ? `/api/ocp/clients?q=${encodeURIComponent(q)}` : '/api/ocp/clients';
    url = addAreaToUrl(url, area);
    
    const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ao buscar cliente (${res.status}): ${text}`);
    }

    const json = await res.json();
    const data = (json?.data ?? []) as Array<{
        id: string;
        name: string;
        birthDate: string;
        guardianName: string | null;
    }>;
    
    const clientsWithAvatar = await Promise.all(
        data.map(async (p) => {
            try {
                const avatarRes = await fetch(`${import.meta.env.VITE_API_URL}/arquivos/getAvatar?ownerId=${p.id}&ownerType=cliente`, {
                    credentials: 'include',
                });
                const avatarData = await avatarRes.json();
                return {
                    id: p.id,
                    name: p.name,
                    guardianName: p.guardianName,
                    age: ageCalc(p.birthDate),
                    birthDate: p.birthDate,
                    photoUrl: avatarData.avatarUrl ?? null
                };
            } catch (error) {
                console.error('❌ Error fetching avatar for', p.name, ':', error);
                return {
                    id: p.id,
                    name: p.name,
                    guardianName: p.guardianName,
                    age: ageCalc(p.birthDate),
                    birthDate: p.birthDate,
                    photoUrl: null
                };
            }
        })
    );
    
    return clientsWithAvatar as Patient[];
}

export async function fetchTherapists(q?: string): Promise<Therapist[]> {
    const baseUrl = `${import.meta.env.VITE_API_URL}/terapeutas`;
    const url = q ? `${baseUrl}?q=${encodeURIComponent(q)}` : baseUrl;
    const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ao buscar terapeuta (${res.status}): ${text}`);
    }

    const json = await res.json();
    const data = (Array.isArray(json) ? json : json?.data ?? []) as Array<{
        id: string;
        nome: string;
    }>;

    const therapistsWithAvatar = await Promise.all(
        data.map(async (t) => {
            try {
                const avatarRes = await fetch(`${import.meta.env.VITE_API_URL}/arquivos/getAvatar?ownerId=${t.id}&ownerType=terapeuta`, {
                    credentials: 'include',
                });
                const avatarData = await avatarRes.json();
                return {
                    id: t.id,
                    name: t.nome,
                    photoUrl: avatarData.avatarUrl ?? null
                };
            } catch (error) {
                console.error('❌ Error fetching avatar for therapist', t.nome, ':', error);
                return {
                    id: t.id,
                    name: t.nome,
                    photoUrl: null
                };
            }
        })
    );
    
    return therapistsWithAvatar as Therapist[];
}