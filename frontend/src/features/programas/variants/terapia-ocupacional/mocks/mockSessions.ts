/**
 * Mock de sessões para desenvolvimento de TO
 * 
 * Formato do preview: array de tentativas individuais
 * - 'independent': desempenhou sem ajuda (verde)
 * - 'prompted': desempenhou com ajuda (amarelo/laranja)  
 * - 'error': não desempenhou (vermelho)
 */

import type { SessionListItem } from '../../../detalhe-ocp/types';
import type { ToActivitySummary } from '../types';

/**
 * Sessões mock com dados de atividades
 */
export const mockToSessions: Array<SessionListItem & { activitiesSummary?: ToActivitySummary[] }> = [
    {
        id: 'session-to-001',
        date: '2025-11-17',
        therapistName: 'João Batista',
        overallScore: 100,
        independenceRate: 74,
        // Preview: 14 independentes, 5 com ajuda, 0 erros = Predominante VERDE
        preview: [
            'independent', 'independent', 'independent', 'independent', 'independent',
            'independent', 'independent', 'independent', 'independent', 'independent',
            'independent', 'independent', 'independent', 'independent',
            'prompted', 'prompted', 'prompted', 'prompted', 'prompted',
        ],
        activitiesSummary: [
            {
                activityId: 'stimulus-1',
                activityName: 'Vestir camiseta',
                counts: {
                    naoDesempenhou: 0,
                    desempenhouComAjuda: 2,
                    desempenhou: 8, // Predominante: VERDE
                },
                total: 10,
            },
            {
                activityId: 'stimulus-2',
                activityName: 'Abotoar camisa',
                counts: {
                    naoDesempenhou: 1,
                    desempenhouComAjuda: 6, // Predominante: LARANJA
                    desempenhou: 2,
                },
                total: 9,
            },
            {
                activityId: 'stimulus-4',
                activityName: 'Escovação dental',
                counts: {
                    naoDesempenhou: 7, // Predominante: VERMELHO
                    desempenhouComAjuda: 2,
                    desempenhou: 1,
                },
                total: 10,
            },
        ],
    },
    {
        id: 'session-to-002',
        date: '2025-11-14',
        therapistName: 'João Batista',
        overallScore: 100,
        independenceRate: 87,
        // Preview: 20 independentes, 3 com ajuda, 0 erros = Predominante VERDE
        preview: [
            'independent', 'independent', 'independent', 'independent', 'independent',
            'independent', 'independent', 'independent', 'independent', 'independent',
            'independent', 'independent', 'independent', 'independent', 'independent',
            'independent', 'independent', 'independent', 'independent', 'independent',
            'prompted', 'prompted', 'prompted',
        ],
        activitiesSummary: [
            {
                activityId: 'stimulus-1',
                activityName: 'Vestir camiseta',
                counts: {
                    naoDesempenhou: 0,
                    desempenhouComAjuda: 0,
                    desempenhou: 11, // Predominante: VERDE
                },
                total: 11,
            },
            {
                activityId: 'stimulus-3',
                activityName: 'Uso de talher adaptado',
                counts: {
                    naoDesempenhou: 0,
                    desempenhouComAjuda: 3,
                    desempenhou: 9, // Predominante: VERDE
                },
                total: 12,
            },
        ],
    },
    {
        id: 'session-to-003',
        date: '2025-11-14',
        therapistName: 'João Batista',
        overallScore: 100,
        independenceRate: 65,
        // Preview: 7 independentes, 15 com ajuda, 1 erro = Predominante LARANJA
        preview: [
            'independent', 'independent', 'independent', 'independent', 'independent',
            'independent', 'independent',
            'prompted', 'prompted', 'prompted', 'prompted', 'prompted',
            'prompted', 'prompted', 'prompted', 'prompted', 'prompted',
            'prompted', 'prompted', 'prompted', 'prompted', 'prompted',
            'error',
        ],
        activitiesSummary: [
            {
                activityId: 'stimulus-2',
                activityName: 'Abotoar camisa',
                counts: {
                    naoDesempenhou: 1,
                    desempenhouComAjuda: 15, // Predominante: LARANJA
                    desempenhou: 7,
                },
                total: 23,
            },
        ],
    },
    {
        id: 'session-to-004',
        date: '2025-11-10',
        therapistName: 'João Batista',
        overallScore: 100,
        independenceRate: 44,
        // Preview: 4 independentes, 12 com ajuda, 2 erros = Predominante LARANJA
        preview: [
            'independent', 'independent', 'independent', 'independent',
            'prompted', 'prompted', 'prompted', 'prompted', 'prompted',
            'prompted', 'prompted', 'prompted', 'prompted', 'prompted',
            'prompted', 'prompted',
            'error', 'error',
        ],
        activitiesSummary: [
            {
                activityId: 'stimulus-3',
                activityName: 'Uso de talher adaptado',
                counts: {
                    naoDesempenhou: 2,
                    desempenhouComAjuda: 12, // Predominante: LARANJA
                    desempenhou: 4,
                },
                total: 18,
            },
            {
                activityId: 'stimulus-4',
                activityName: 'Escovação dental',
                counts: {
                    naoDesempenhou: 0,
                    desempenhouComAjuda: 2,
                    desempenhou: 7, // Predominante: VERDE
                },
                total: 9,
            },
        ],
    },
    {
        id: 'session-to-005',
        date: '2025-11-10',
        therapistName: 'João Batista',
        overallScore: 58,
        independenceRate: 15,
        // Preview: 4 independentes, 7 com ajuda, 15 erros = Predominante VERMELHO
        preview: [
            'independent', 'independent', 'independent', 'independent',
            'prompted', 'prompted', 'prompted', 'prompted', 'prompted',
            'prompted', 'prompted',
            'error', 'error', 'error', 'error', 'error',
            'error', 'error', 'error', 'error', 'error',
            'error', 'error', 'error', 'error', 'error',
        ],
        activitiesSummary: [
            {
                activityId: 'stimulus-1',
                activityName: 'Vestir camiseta',
                counts: {
                    naoDesempenhou: 15, // Predominante: VERMELHO
                    desempenhouComAjuda: 7,
                    desempenhou: 4,
                },
                total: 26,
            },
        ],
    },
];
