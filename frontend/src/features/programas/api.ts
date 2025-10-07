import type { ProgramDetail } from './detalhe-ocp/types';

type Patient = {
    id: string;
    name: string;
    guardianName?: string;
    age?: number;
    photoUrl?: string | null;
};

function ageCalc(birthDate: string) {
    return new Date().getFullYear() - new Date(birthDate).getFullYear();
}

export async function fetchProgram(programId: string): Promise<ProgramDetail> {
    const res = await fetch(`/api/ocp/programs/${programId}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Erro ao buscar programas: ${res.statusText}`);

    const data = await res.json();
    console.log(data.data);
    return data.data;
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
    return data.map(p => ({
        id: p.id,
        name: p.name,
        guardianName: p.guardianName,
        age: ageCalc(p.birthDate),
        photoUrl: null
    })) as Patient[];
}