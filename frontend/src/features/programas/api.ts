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

    const json = await res.json();
    const data = json.data;
    
    console.log('📸 Dados do programa:', data);
    
    // Buscar foto do cliente diretamente da API de arquivos
    let patientPhotoUrl = null;
    if (data.patientId) {
        try {
            const clientRes = await fetch(`/api/clientes/${data.patientId}`, { 
                credentials: 'include' 
            });
            if (clientRes.ok) {
                const clientData = await clientRes.json();
                console.log('📸 Dados do cliente:', clientData);
                
                // Procurar arquivo de foto de perfil
                const fotoPerfil = clientData.arquivos?.find((doc: { nome: string; arquivo_id: string }) => doc.nome === 'fotoPerfil');
                if (fotoPerfil) {
                    patientPhotoUrl = `${import.meta.env.VITE_API_URL}/arquivos/view/${fotoPerfil.arquivo_id}`;
                    console.log('📸 Foto encontrada:', patientPhotoUrl);
                }
            }
        } catch (error) {
            console.log('📸 Erro ao buscar foto do cliente:', error);
        }
    }
    
    return {
        ...data,
        patientPhotoUrl,
    };
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
        arquivos?: Array<{ nome: string; arquivo_id: string }>;
    }>;
    
    return data.map(p => {
        // Buscar foto de perfil nos arquivos
        const fotoPerfil = p.arquivos?.find((doc) => doc.nome === 'fotoPerfil');
        const photoUrl = fotoPerfil 
            ? `${import.meta.env.VITE_API_URL}/arquivos/view/${fotoPerfil.arquivo_id}`
            : null;
            
        return {
            id: p.id,
            name: p.name,
            guardianName: p.guardianName,
            age: ageCalc(p.birthDate),
            photoUrl
        };
    }) as Patient[];
}