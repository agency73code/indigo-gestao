import type { ProgramDetail, SessionState } from './types';
import * as Api from '../api';
import { searchPatients } from '@/features/programas/consultar-programas/services';
import { listPrograms } from '@/features/programas/consultar-programas/services';

export const searchPatientsForSession = searchPatients;
export const listProgramsForSession = listPrograms;

export async function getProgramDetail(programId: string): Promise<ProgramDetail> {
    const program = await Api.fetchProgram(programId);
    return program;
}

export async function saveSession(sessionData: { 
    patientId: string; 
    programId: string; 
    attempts: SessionState['attempts'];
    notes?: string;
}): Promise<{ id: string }> {
    const res = await fetch(`/api/ocp/programs/${sessionData.programId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
            patientId: sessionData.patientId, 
            attempts: sessionData.attempts,
            notes: sessionData.notes,
        }),
    });
    
    if (!res.ok) {
        throw new Error('Erro ao salvar sessão');
    }

    return res.json();
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

    const promptedAttempts = attempts.filter(attempt => attempt.type === 'prompted').length
    const independentAttempts = attempts.filter(attempt => attempt.type === 'independent').length;
    
    return {
        overallAccuracy: Math.round(((independentAttempts + promptedAttempts) / totalAttempts) * 100),
        independenceRate: Math.round((independentAttempts / totalAttempts) * 100),
        totalAttempts,
    };
}