import type { ProgramDetail } from './detalhe-ocp/types';

type Patient = {
    id: string;
    name: string;
    guardianName?: string;
    age?: number;
    birthDate?: string | null;
    photoUrl?: string | null;
};

function ageCalc(birthDate: string) {
    return new Date().getFullYear() - new Date(birthDate).getFullYear();
}

export async function fetchProgram(programId: string): Promise<ProgramDetail> {
    const res = await fetch(`/api/ocp/programs/${programId}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Erro ao buscar programas: ${res.statusText}`);

    const json = await res.json();
    const program = json.data as ProgramDetail;
    
    // Buscar avatar do cliente
    try {
        const clientAvatarRes = await fetch(`${import.meta.env.VITE_API_URL}/arquivos/getAvatar?id=${program.patientId}&type=client`, {
            credentials: 'include',
        });
        const clientAvatarData = await clientAvatarRes.json();
        program.patientPhotoUrl = clientAvatarData.avatarUrl ?? null;
    } catch {
        program.patientPhotoUrl = null;
    }
    
    // Buscar avatar do terapeuta
    try {
        const avatarRes = await fetch(`${import.meta.env.VITE_API_URL}/arquivos/getAvatar?id=${program.therapistId}&type=therapist`, {
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
    const url = q ? `/api/ocp/clients?q=${encodeURIComponent(q)}` : '/api/ocp/clients'
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
                const avatarRes = await fetch(`${import.meta.env.VITE_API_URL}/arquivos/getAvatar?id=${p.id}&type=client`, {
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
            } catch {
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