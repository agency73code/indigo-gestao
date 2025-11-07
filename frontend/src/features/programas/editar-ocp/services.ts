import * as Api from '../api';
import type { ProgramDetail, UpdateProgramInput } from './types';

export async function fetchProgramById(programaId: string): Promise<ProgramDetail> {
    const program = await Api.fetchProgram(programaId);
    return program;
}

export async function updateProgram(input: UpdateProgramInput): Promise<void> {
    const res = await fetch(`/api/ocp/programs/${input.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    });

    if (!res.ok) {
        let message = `Erro ao atualizar programa (${res.status})`;

        try {
            const data = await res.json();

            if (data?.errors && Array.isArray(data.errors)) {
                // Mostra apenas o primeiro erro do array
                message = data.errors[0]?.message || 'Erro de validação nos dados enviados.';
            } else if (data?.message) {
                message = data.message;
            }
        } catch {
            message = res.statusText || message;
        }

        throw new Error(message);
    }
}

export async function createProgramVersion(_input: UpdateProgramInput): Promise<{ id: string }> {  
    throw new Error('API real ainda não implementada');
}

export async function archiveProgram(_id: string): Promise<void> {
    // TODO: Implementar chamada real para API quando disponível
    // const response = await fetch(`/api/programs/${id}/archive`, {
    //     method: 'PATCH'
    // });
    // if (!response.ok) {
    //     throw new Error(`Erro ao arquivar programa: ${response.statusText}`);
    // }
    
    throw new Error('API real ainda não implementada');
}