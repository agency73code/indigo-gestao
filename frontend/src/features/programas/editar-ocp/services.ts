import type { ProgramDetail, UpdateProgramInput } from './types';

// Flag para controlar uso de mocks durante desenvolvimento
const USE_LOCAL_MOCKS = true;

export async function fetchProgramById(programaId: string): Promise<ProgramDetail> {
    if (USE_LOCAL_MOCKS) {
        // Reutilizar mock do detalhe-ocp
        const { mockProgramDetail } = await import('../detalhe-ocp/mocks/program.mock');
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            ...mockProgramDetail,
            id: programaId
        };
    }
    
    // TODO: Implementar chamada real para API quando disponível
    // const response = await fetch(`/api/programs/${programaId}`);
    // if (!response.ok) {
    //     throw new Error(`Erro ao buscar programa: ${response.statusText}`);
    // }
    // return await response.json();
    
    throw new Error('API real ainda não implementada');
}

export async function updateProgram(input: UpdateProgramInput): Promise<void> {
    if (USE_LOCAL_MOCKS) {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simular sucesso (em produção, fazer validação e salvar)
        console.log('Programa atualizado (mock):', input);
        return;
    }
    
    // TODO: Implementar chamada real para API quando disponível
    // const response = await fetch(`/api/programs/${input.id}`, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(input)
    // });
    // if (!response.ok) {
    //     throw new Error(`Erro ao atualizar programa: ${response.statusText}`);
    // }
    
    throw new Error('API real ainda não implementada');
}

export async function createProgramVersion(input: UpdateProgramInput): Promise<{ id: string }> {
    if (USE_LOCAL_MOCKS) {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Simular criação de nova versão
        const newId = `prog-${Date.now()}`;
        console.log('Nova versão do programa criada (mock):', { ...input, id: newId });
        
        return { id: newId };
    }
    
    // TODO: Implementar chamada real para API quando disponível
    // const { id, ...dataWithoutId } = input;
    // const response = await fetch('/api/programs', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ ...dataWithoutId, basedOnId: id })
    // });
    // if (!response.ok) {
    //     throw new Error(`Erro ao criar nova versão: ${response.statusText}`);
    // }
    // return await response.json();
    
    throw new Error('API real ainda não implementada');
}

export async function archiveProgram(id: string): Promise<void> {
    if (USE_LOCAL_MOCKS) {
        // Simular delay de rede
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