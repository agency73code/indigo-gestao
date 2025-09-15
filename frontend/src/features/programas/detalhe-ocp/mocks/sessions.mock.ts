import type { SessionListItem } from '../types';

export const mockRecentSessions: SessionListItem[] = [
    {
        id: 'sess-001',
        date: '2025-09-12T14:00:00.000Z',
        therapistName: 'Dra. Juliana Oliveira',
        overallScore: 75,
        independenceRate: 60,
        preview: ['independent', 'prompted', 'independent', 'error', 'independent', 'prompted', 'independent', 'independent']
    },
    {
        id: 'sess-002',
        date: '2025-09-10T15:30:00.000Z',
        therapistName: 'Dra. Juliana Oliveira',
        overallScore: 80,
        independenceRate: 70,
        preview: ['independent', 'independent', 'prompted', 'independent', 'independent', 'error', 'independent', 'prompted']
    },
    {
        id: 'sess-003',
        date: '2025-09-08T14:00:00.000Z',
        therapistName: 'Dr. Carlos Mendes',
        overallScore: 65,
        independenceRate: 55,
        preview: ['prompted', 'independent', 'error', 'prompted', 'independent', 'independent', 'error', 'prompted']
    },
    {
        id: 'sess-004',
        date: '2025-09-05T16:00:00.000Z',
        therapistName: 'Dra. Juliana Oliveira',
        overallScore: 70,
        independenceRate: 58,
        preview: ['independent', 'prompted', 'independent', 'prompted', 'error', 'independent', 'independent', 'prompted']
    },
    {
        id: 'sess-005',
        date: '2025-09-03T14:30:00.000Z',
        therapistName: 'Dr. Carlos Mendes',
        overallScore: 68,
        independenceRate: 52,
        preview: ['prompted', 'independent', 'prompted', 'independent', 'error', 'prompted', 'independent', 'error']
    }
];