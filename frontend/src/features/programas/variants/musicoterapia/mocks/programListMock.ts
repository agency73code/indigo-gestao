/**
 * Mock de lista de programas de Musicoterapia para consulta
 */

import type { ProgramListItem } from '../../../nova-sessao/types';

export const mockMusiProgramList: ProgramListItem[] = [
    {
        id: 'mock-musi-001',
        name: 'Programa de Expressão Musical e Ritmo',
        patientId: 'mock-patient-001',
        patientName: 'Alessandro Martins',
        patientAge: 4,
        therapistId: 'mock-therapist-001',
        therapistName: 'Mariana Santos',
        status: 'active',
        createdAt: '2025-11-20T10:00:00.000Z',
        lastSessionDate: '2025-11-28',
        sessionsCount: 5,
    },
    {
        id: 'mock-musi-002',
        name: 'Desenvolvimento de Percepção Auditiva',
        patientId: 'mock-patient-002',
        patientName: 'Beatriz Oliveira',
        patientAge: 6,
        therapistId: 'mock-therapist-001',
        therapistName: 'Mariana Santos',
        status: 'active',
        createdAt: '2025-11-15T14:00:00.000Z',
        lastSessionDate: '2025-11-26',
        sessionsCount: 8,
    },
    {
        id: 'mock-musi-003',
        name: 'Interação Social através da Música',
        patientId: 'mock-patient-003',
        patientName: 'Carlos Eduardo',
        patientAge: 5,
        therapistId: 'mock-therapist-002',
        therapistName: 'João Pedro',
        status: 'paused',
        createdAt: '2025-10-10T09:00:00.000Z',
        lastSessionDate: '2025-11-10',
        sessionsCount: 12,
    },
];
