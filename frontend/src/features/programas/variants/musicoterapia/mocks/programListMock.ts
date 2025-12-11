/**
 * Mock de lista de programas de Musicoterapia para consulta
 * Dados consistentes com o programa detalhado em programMock.ts
 */

import type { ProgramListItem } from '../../../consultar-programas/types';

export const mockMusiProgramList: ProgramListItem[] = [
    {
        id: 'mock-musi-001',
        title: 'Programa de Expressão Musical e Ritmo',
        objective: 'Desenvolver habilidades de expressão musical e coordenação rítmica',
        patientId: 'mock-patient-001',
        patientName: 'Alessandro Braga',
        status: 'active',
        lastSession: '2025-11-28',
    },
    {
        id: 'mock-musi-002',
        title: 'Desenvolvimento de Percepção Auditiva',
        objective: 'Estimular a percepção auditiva e reconhecimento de sons musicais',
        patientId: 'mock-patient-002',
        patientName: 'Beatriz Oliveira',
        status: 'active',
        lastSession: '2025-11-26',
    },
    {
        id: 'mock-musi-003',
        title: 'Interação Social através da Música',
        objective: 'Promover interação social e comunicação utilizando atividades musicais em grupo',
        patientId: 'mock-patient-003',
        patientName: 'Carlos Eduardo',
        status: 'archived',
        lastSession: '2025-11-10',
    },
];
