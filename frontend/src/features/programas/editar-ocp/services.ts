import * as Api from '../api';
import type { ProgramDetail, UpdateProgramInput } from './types';

// Flag para controlar uso de mocks durante desenvolvimento
const USE_LOCAL_MOCKS = true;

export async function fetchProgramById(programaId: string): Promise<ProgramDetail> {
    try {
        return await Api.fetchProgram(programaId);
    } catch (err) {
        if (USE_LOCAL_MOCKS) {
            const { mockProgramDetail } = await import('../detalhe-ocp/mocks/program.mock');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            return {
                ...mockProgramDetail,
                id: programaId
            };
        }
        throw err;
    }
}

export async function updateProgram(input: UpdateProgramInput): Promise<void> {
    try {
        console.log(input);
        const res = await fetch(`/api/ocp/programs/${input.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
        });

        if (!res.ok) throw new Error(`Erro ao atualizar programa: ${res.statusText}`);
        console.log(res);
    } catch (err) {
        if (USE_LOCAL_MOCKS) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Programa atualizado (mock):', input);
            return;
        }
        throw err;
    }
}

export async function createProgramVersion(input: UpdateProgramInput): Promise<{ id: string }> {
    if (USE_LOCAL_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        const newId = `prog-${Date.now()}`;
        console.log('Nova versão do programa criada (mock):', { ...input, id: newId });
        return { id: newId };
    }
    
    throw new Error('API real ainda não implementada');
}

export async function archiveProgram(id: string): Promise<void> {
    if (USE_LOCAL_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 800));
        console.log('Programa arquivado (mock):', id);
        return;
    }
    
    // TODO: Implementar chamada real para API quando disponível
    // const response = await fetch(`/api/programs/${id}/archive`, {
    //     method: 'PATCH'
    // });
    // if (!response.ok) {
    //     throw new Error(`Erro ao arquivar programa: ${response.statusText}`);
    // }
    
    throw new Error('API real ainda não implementada');
}