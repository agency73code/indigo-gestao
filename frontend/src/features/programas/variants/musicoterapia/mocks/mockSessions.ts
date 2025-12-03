/**
 * Mock de sessões de Musicoterapia para desenvolvimento
 */

import type { SessionListItem } from '../../../detalhe-ocp/types';

export const mockMusiSessions: SessionListItem[] = [
    {
        id: 'session-musi-001',
        date: '2025-11-28',
        therapistName: 'Mariana Santos',
        overallScore: 85,
        independenceRate: 60,
        preview: ['independent', 'independent', 'prompted', 'independent', 'prompted'],
    },
    {
        id: 'session-musi-002',
        date: '2025-11-25',
        therapistName: 'Mariana Santos',
        overallScore: 75,
        independenceRate: 50,
        preview: ['independent', 'prompted', 'prompted', 'independent', 'error'],
    },
    {
        id: 'session-musi-003',
        date: '2025-11-22',
        therapistName: 'Mariana Santos',
        overallScore: 70,
        independenceRate: 45,
        preview: ['prompted', 'independent', 'prompted', 'error', 'independent'],
    },
    {
        id: 'session-musi-004',
        date: '2025-11-18',
        therapistName: 'Mariana Santos',
        overallScore: 65,
        independenceRate: 40,
        preview: ['prompted', 'prompted', 'independent', 'error', 'prompted'],
    },
    {
        id: 'session-musi-005',
        date: '2025-11-15',
        therapistName: 'Mariana Santos',
        overallScore: 60,
        independenceRate: 35,
        preview: ['error', 'prompted', 'independent', 'prompted', 'error'],
    },
];

export const mockMusiSessionsDetailed = mockMusiSessions.map((session, index) => ({
    ...session,
    patientId: 'mock-patient-001',
    patientName: 'Alessandro Martins',
    programId: 'mock-musi-001',
    programName: 'Programa de Expressão Musical e Ritmo',
    goalTitle: 'Desenvolver habilidades de expressão musical e coordenação rítmica',
    achieved: index % 3 === 0 ? 'sim' : index % 3 === 1 ? 'parcial' : 'nao' as const,
    frequency: 5 + index,
    durationMin: 30 + index * 5,
    performanceNotes: `Sessão ${index + 1}: Paciente demonstrou ${index % 2 === 0 ? 'boa' : 'moderada'} participação nas atividades musicais propostas.`,
    clinicalNotes: index % 2 === 0 ? 'Observou-se melhora na atenção compartilhada.' : null,
}));
