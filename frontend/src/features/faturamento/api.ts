/**
 * API functions for Faturamento feature
 * Centralized API calls to ensure proper filtering by therapist
 */

/**
 * Patient type matching the format expected by Faturamento forms
 * This matches the structure from @/features/consultas/types/consultas.types
 */
type Patient = {
    id: string;
    nome: string;
    responsavel?: string;
    status: 'ATIVO' | 'INATIVO';
    avatarUrl?: string;
    pessoa?: {
        dataNascimento?: string;
    };
};

/**
 * Fetch clients filtered by logged-in therapist
 * This endpoint (/api/ocp/clients) automatically filters by the authenticated therapist
 * @param q Optional search query to filter clients by name or guardian name
 * @returns Promise<Patient[]> List of clients assigned to the logged-in therapist
 */
export async function fetchClients(q?: string): Promise<Patient[]> {
    const url = q ? `/api/ocp/clients?q=${encodeURIComponent(q)}` : '/api/ocp/clients';
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

    // Map the API response to the expected Patient format
    return data.map(p => ({
        id: p.id,
        nome: p.name, // Map 'name' from API to 'nome' for the form
        responsavel: p.guardianName ?? undefined,
        status: 'ATIVO' as const,
        avatarUrl: undefined,
        pessoa: {
            dataNascimento: p.birthDate,
        },
    })) as Patient[];
}
