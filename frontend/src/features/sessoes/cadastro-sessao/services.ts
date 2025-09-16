import type { ProgramDetail, SessionState } from './types';

// Flag para usar mocks locais (reutilizar padrão existente)
const USE_LOCAL_MOCKS = true;

// Importar mocks existentes
import { searchPatients } from '@/features/programas/consultar-programas/services';
import { listPrograms } from '@/features/programas/consultar-programas/services';
import { mockProgramDetail } from '@/features/programas/detalhe-ocp/mocks/program.mock';

// Buscar pacientes (reutilizando serviço existente)
export const searchPatientsForSession = searchPatients;

// Buscar programas por paciente (reutilizando serviço existente)  
export const listProgramsForSession = listPrograms;

// Buscar detalhes do programa
export async function getProgramDetail(programId: string): Promise<ProgramDetail> {
    if (USE_LOCAL_MOCKS) {
        // Simulação de delay para UX realista
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Retorna o mock existente adaptado com o programId solicitado
        return {
            ...mockProgramDetail,
            id: programId,
        };
    }
    
    // TODO: Implementar chamada real para API
    const response = await fetch(`/api/programs/${programId}`);
    if (!response.ok) {
        throw new Error('Erro ao carregar programa');
    }
    return response.json();
}

// Salvar sessão
export async function saveSession(sessionData: {
    patientId: string;
    programId: string;
    attempts: SessionState['attempts'];
}): Promise<{ id: string }> {
    if (USE_LOCAL_MOCKS) {
        // Simulação de delay para UX realista
        await new Promise(resolve => setTimeout(resolve, 800));
        
        console.log('Sessão salva (mock):', sessionData);
        
        return {
            id: `session-${Date.now()}`
        };
    }
    
    // TODO: Implementar chamada real para API
    const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
    });
    
    if (!response.ok) {
        throw new Error('Erro ao salvar sessão');
    }
    
    return response.json();
}

// Calcular resumo da sessão
export function calculateSessionSummary(attempts: SessionState['attempts']): SessionState['summary'] {
    const totalAttempts = attempts.length;
    
    if (totalAttempts === 0) {
        return {
            overallAccuracy: 0,
            independenceRate: 0,
            totalAttempts: 0,
        };
    }
    
    const independentAttempts = attempts.filter(attempt => attempt.type === 'independent').length;
    
    return {
        overallAccuracy: Math.round((independentAttempts / totalAttempts) * 100),
        independenceRate: Math.round((independentAttempts / totalAttempts) * 100),
        totalAttempts,
    };
}