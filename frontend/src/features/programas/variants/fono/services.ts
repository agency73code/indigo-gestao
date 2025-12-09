import type { Patient, Therapist, CreateProgramInput } from '../../core/types';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Serviços de API para Fonoaudiologia
 */

function ageCalculation(isoDateString: string): number {
  const hoje = new Date();
  const nascimento = new Date(isoDateString);

  let idade = hoje.getFullYear() - nascimento.getFullYear();

  const mes = hoje.getMonth() - nascimento.getMonth();
  const dia = hoje.getDate() - nascimento.getDate();

  // Se ainda não fez aniversário este ano, tira 1
  if (mes < 0 || (mes === 0 && dia < 0)) {
    idade--;
  }

  return idade;
}

export async function fetchFonoPatientById(id: string): Promise<Patient> {
    const response = await fetch(`${API_URL}/clientes/${id}`, {
        credentials: 'include',
    });
    
    if (!response.ok) {
        throw new Error('Erro ao buscar cliente');
    }
    
    const data = await response.json();
    const client = data.data;
    const photoUrl = await fetchToClientAvatar(client.id)

    return {
        id: client.id,
        name: client.nome,
        guardianName: client.cuidadores[0].nome,
        age: ageCalculation(client.dataNascimento),
        photoUrl,
    };
}

export async function fetchToClientAvatar(clientId: string): Promise<string | null> {
    try {
        const response = await fetch(
            `${API_URL}/arquivos/getAvatar?ownerId=${clientId}&ownerType=cliente`,
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

export async function fetchFonoTherapistById(id: string): Promise<Therapist> {
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

export async function fetchFonoTherapistAvatar(therapistId: string): Promise<string | null> {
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

export async function createFonoProgram(input: CreateProgramInput): Promise<{ id: string }> {
    const response = await fetch(`${API_URL}/ocp/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            ...input,
            area: 'fonoaudiologia',
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar programa');
    }

    const result = await response.json();

    return { id: String(result.id) };
}

export async function listFonoPrograms(params: {
    patientId: string;
    q?: string;
    status?: 'active' | 'archived' | 'all';
    sort?: 'recent' | 'alphabetic';
    page?: number;
}): Promise<any[]> {
    const url = new URL(`${API_URL}/ocp/clients/${params.patientId}/programs`);
    
    // Filtrar apenas programas de Fonoaudiologia pela área de atuação do terapeuta
    url.searchParams.set('area', 'fonoaudiologia');
    
    if (params.page) url.searchParams.set('page', params.page.toString());
    if (params.status && params.status !== 'all') url.searchParams.set('status', params.status);
    if (params.q) url.searchParams.set('q', params.q);
    if (params.sort) url.searchParams.set('sort', params.sort);

    const response = await fetch(url.toString(), {
        credentials: 'include',
        headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
        throw new Error('Erro ao buscar programas de Fonoaudiologia');
    }

    const json = await response.json();
    return (json?.data ?? []);
}
