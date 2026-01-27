import type { ProgramDetail, SessionState, DadosFaturamentoSessao } from './types';
import type { SessionFile } from './components/FonoSessionFiles';
import * as Api from '../api';
import { searchPatients } from '@/features/programas/consultar-programas/services';
import { listPrograms } from '@/features/programas/consultar-programas/services';
import { buildSessionFormData } from '@/lib/api';

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
    files?: SessionFile[];
    faturamento?: DadosFaturamentoSessao;
}): Promise<{ id: string }> {

    // Com arquivos: usar FormData (quando backend suportar)
    const payload = {
        patientId: sessionData.patientId,
        programId: sessionData.programId,
        attempts: sessionData.attempts,
        notes: sessionData.notes,
        files: sessionData.files,
        area: 'fonoaudiologia' as const,
        faturamento: sessionData.faturamento,
    };
    const formData = buildSessionFormData(payload);

    const res = await fetch(`/api/ocp/programs/${sessionData.programId}/sessions`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
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