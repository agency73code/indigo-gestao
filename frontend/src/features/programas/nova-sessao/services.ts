import type { ProgramDetail, SessionState } from './types';
import * as Api from '../api';

const USE_LOCAL_MOCKS = true;

import { searchPatients } from '@/features/programas/consultar-programas/services';
import { listPrograms } from '@/features/programas/consultar-programas/services';
import { mockProgramDetail } from '@/features/programas/detalhe-ocp/mocks/program.mock';

export const searchPatientsForSession = searchPatients;
export const listProgramsForSession = listPrograms;

export async function getProgramDetail(programId: string): Promise<ProgramDetail> {
    try {
        const program = await Api.fetchProgram(programId);
        return program;
    } catch (error) {
        if (USE_LOCAL_MOCKS) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return {
                ...mockProgramDetail,
                id: programId,
            };
        }
        throw error;
    }
}

export async function saveSession(sessionData: { patientId: string; programId: string; attempts: SessionState['attempts'] }): Promise<{ id: string }> {
    try {
        const res = await fetch(`/api/ocp/programs/${sessionData.programId}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ patientId: sessionData.patientId, attempts: sessionData.attempts }),
        });
        
        if (!res.ok) {
            throw new Error('Erro ao salvar sessão');
        }

        return res.json();
    }catch (error) {
        if (USE_LOCAL_MOCKS) {
            await new Promise(resolve => setTimeout(resolve, 800));
            
            console.log('Sessão salva (mock):', sessionData);
            
            return {
                id: `session-${Date.now()}`
            };
        }
        throw error
    }
}

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