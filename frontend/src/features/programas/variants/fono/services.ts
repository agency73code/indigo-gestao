import type { Patient, Therapist, CreateProgramInput } from '../../core/types';
import { getCurrentAreaFromStorage } from '@/utils/apiWithArea';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Serviços de API para o modelo base (Fonoaudiologia, Psicopedagogia, Terapia ABA)
 * 
 * IMPORTANTE: Estes serviços são compartilhados por áreas que usam o mesmo modelo:
 * - Fonoaudiologia
 * - Psicopedagogia  
 * - Terapia ABA
 * 
 * A área é obtida automaticamente do contexto (localStorage) para garantir
 * que os dados sejam salvos e filtrados pela área correta.
 */

/**
 * Retorna a área atual do contexto, com fallback para 'fonoaudiologia'
 */
function getArea(): string {
    return getCurrentAreaFromStorage() || 'fonoaudiologia';
}

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
    const response = await fetch(`${API_URL}/terapeutas/${id}/sumario`, {
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
    const area = getArea();
    const url = new URL(`${API_URL}/ocp/clients/${params.patientId}/programs`);
    
    // Filtrar programas pela área atual do contexto
    url.searchParams.set('area', area);
    
    if (params.page) url.searchParams.set('page', params.page.toString());
    if (params.status && params.status !== 'all') url.searchParams.set('status', params.status);
    if (params.q) url.searchParams.set('q', params.q);
    if (params.sort) url.searchParams.set('sort', params.sort);

    const response = await fetch(url.toString(), {
        credentials: 'include',
        headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`Erro ao buscar programas de ${area}`);
    }

    const json = await response.json();
    return (json?.data ?? []);
}
