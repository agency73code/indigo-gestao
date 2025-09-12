// MOCKS DE USO LOCAL EM DEV. NÃO COMMITAR EM PRODUÇÃO.
import type { ProgramListItem } from '../types';

export const mockPrograms: ProgramListItem[] = [
    {
        id: '1',
        title: 'Programa de Coordenação Motora',
        objective: 'Desenvolver habilidades de coordenação e equilíbrio',
        lastSession: '2025-09-10',
        status: 'active',
        patientId: '1',
    },
    {
        id: '2',
        title: 'Fortalecimento Muscular',
        objective: 'Aumentar força e resistência muscular',
        lastSession: '2025-09-08',
        status: 'active',
        patientId: '1',
    },
    {
        id: '3',
        title: 'Programa Respiratório',
        objective: 'Melhorar capacidade respiratória',
        status: 'archived',
        patientId: '2',
    },
];
