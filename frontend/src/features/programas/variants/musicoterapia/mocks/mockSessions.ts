/**
 * Mock de sessões de Musicoterapia para desenvolvimento
 * 
 * Formato do preview: array de tentativas individuais
 * - 'independent': desempenhou sem ajuda (verde)
 * - 'prompted': desempenhou com ajuda (amarelo/laranja)  
 * - 'error': não desempenhou (vermelho)
 * 
 * IMPORTANTE: Musicoterapia usa estrutura similar ao TO mas com foco em
 * desenvolvimento de habilidades através de atividades musicais
 */

import type { SessionListItem } from '../../../detalhe-ocp/types';
import type { MusiActivitySummary } from '../types';

/**
 * Sessões mock com dados de atividades de Musicoterapia
 */
export const mockMusiSessions: Array<SessionListItem & { activitiesSummary?: MusiActivitySummary[], observacoes?: string, programId?: string }> = [
    {
        id: 'session-musi-001',
        programId: 'mock-musi-001',
        date: '2025-11-28',
        therapistName: 'Mariana Santos',
        overallScore: 85,
        independenceRate: 70,
        observacoes: 'Alessandro demonstrou excelente progresso na identificação de conceitos espaciais através da música. Conseguiu executar sequências rítmicas coordenadas com mais fluência. Manteve atenção durante toda a sessão de 45 minutos.',
        // Preview: 17 independentes, 7 com ajuda, 0 erros = Predominante VERDE
        preview: [
            'independent', 'independent', 'independent', 'independent', 'independent',
            'independent', 'independent', 'independent', 'independent', 'independent',
            'independent', 'independent', 'independent', 'independent', 'independent',
            'independent', 'independent',
            'prompted', 'prompted', 'prompted', 'prompted', 'prompted',
            'prompted', 'prompted',
        ],
        activitiesSummary: [
            {
                activityId: 'stim-1',
                activityName: 'Compreender conceitos espaciais',
                counts: {
                    naoDesempenhou: 0,
                    desempenhouComAjuda: 2,
                    desempenhou: 8, // Predominante: VERDE
                },
                total: 10,
                durationMinutes: 12,
            },
            {
                activityId: 'stim-2',
                activityName: 'Desenvolver coordenação motora',
                counts: {
                    naoDesempenhou: 0,
                    desempenhouComAjuda: 3,
                    desempenhou: 7, // Predominante: VERDE
                },
                total: 10,
                durationMinutes: 15,
            },
            {
                activityId: 'stim-3',
                activityName: 'Estimular comunicação verbal',
                counts: {
                    naoDesempenhou: 0,
                    desempenhouComAjuda: 2,
                    desempenhou: 2, // Predominante: VERDE (empate com ajuda)
                },
                total: 4,
                durationMinutes: 10,
            },
        ],
    },
    {
        id: 'session-musi-002',
        programId: 'mock-musi-001',
        date: '2025-11-25',
        therapistName: 'Mariana Santos',
        overallScore: 75,
        independenceRate: 60,
        observacoes: 'Boa participação nas atividades musicais. Alessandro mostrou-se mais receptivo às canções infantis conhecidas, vocalizando espontaneamente em alguns momentos. Recomendo continuar trabalhando as mesmas músicas para consolidação.',
        // Preview: 12 independentes, 8 com ajuda, 0 erros = Predominante VERDE
        preview: [
            'independent', 'independent', 'independent', 'independent', 'independent',
            'independent', 'independent', 'independent', 'independent', 'independent',
            'independent', 'independent',
            'prompted', 'prompted', 'prompted', 'prompted', 'prompted',
            'prompted', 'prompted', 'prompted',
        ],
        activitiesSummary: [
            {
                activityId: 'stim-1',
                activityName: 'Compreender conceitos espaciais',
                counts: {
                    naoDesempenhou: 0,
                    desempenhouComAjuda: 4,
                    desempenhou: 6, // Predominante: VERDE
                },
                total: 10,
                durationMinutes: 12,
            },
            {
                activityId: 'stim-3',
                activityName: 'Estimular comunicação verbal',
                counts: {
                    naoDesempenhou: 0,
                    desempenhouComAjuda: 4,
                    desempenhou: 6, // Predominante: VERDE
                },
                total: 10,
                durationMinutes: 18,
            },
        ],
    },
    {
        id: 'session-musi-003',
        programId: 'mock-musi-001',
        date: '2025-11-22',
        therapistName: 'Mariana Santos',
        overallScore: 70,
        independenceRate: 48,
        observacoes: 'Trabalhamos intensivamente regulação emocional através de diferentes estilos musicais. Alessandro precisou de apoio para identificar emoções, mas respondeu bem às atividades de escuta ativa. Importante continuar usando apoios visuais.',
        // Preview: 10 independentes, 11 com ajuda, 0 erros = Predominante LARANJA
        preview: [
            'independent', 'independent', 'independent', 'independent', 'independent',
            'independent', 'independent', 'independent', 'independent', 'independent',
            'prompted', 'prompted', 'prompted', 'prompted', 'prompted',
            'prompted', 'prompted', 'prompted', 'prompted', 'prompted',
            'prompted',
        ],
        activitiesSummary: [
            {
                activityId: 'stim-2',
                activityName: 'Desenvolver coordenação motora',
                counts: {
                    naoDesempenhou: 0,
                    desempenhouComAjuda: 5,
                    desempenhou: 5, // Predominante: LARANJA (empate)
                },
                total: 10,
                durationMinutes: 15,
            },
            {
                activityId: 'stim-4',
                activityName: 'Promover regulação emocional',
                counts: {
                    naoDesempenhou: 0,
                    desempenhouComAjuda: 6, // Predominante: LARANJA
                    desempenhou: 5,
                },
                total: 11,
                durationMinutes: 20,
            },
        ],
    },
    {
        id: 'session-musi-004',
        programId: 'mock-musi-001',
        date: '2025-11-18',
        therapistName: 'Mariana Santos',
        overallScore: 65,
        independenceRate: 42,
        observacoes: 'Sessão focada em coordenação motora com instrumentos de percussão. Alessandro apresentou dificuldade em alternar mãos de forma coordenada, necessitando de modelo visual constante. Sugiro treino adicional com sequências mais simples.',
        // Preview: 8 independentes, 11 com ajuda, 0 erros = Predominante LARANJA
        preview: [
            'independent', 'independent', 'independent', 'independent', 'independent',
            'independent', 'independent', 'independent',
            'prompted', 'prompted', 'prompted', 'prompted', 'prompted',
            'prompted', 'prompted', 'prompted', 'prompted', 'prompted',
            'prompted',
        ],
        activitiesSummary: [
            {
                activityId: 'stim-2',
                activityName: 'Desenvolver coordenação motora',
                counts: {
                    naoDesempenhou: 0,
                    desempenhouComAjuda: 11, // Predominante: LARANJA
                    desempenhou: 8,
                },
                total: 19,
                durationMinutes: 30,
            },
        ],
    },
    {
        id: 'session-musi-005',
        programId: 'mock-musi-001',
        date: '2025-11-15',
        therapistName: 'Mariana Santos',
        overallScore: 60,
        independenceRate: 35,
        observacoes: 'Primeira sessão com as atividades de comunicação verbal através de canções. Alessandro mostrou-se tímido inicialmente, mas aos poucos começou a vocalizar. Importante manter ambiente encorajador e livre de pressões.',
        // Preview: 7 independentes, 13 com ajuda, 0 erros = Predominante LARANJA
        preview: [
            'independent', 'independent', 'independent', 'independent', 'independent',
            'independent', 'independent',
            'prompted', 'prompted', 'prompted', 'prompted', 'prompted',
            'prompted', 'prompted', 'prompted', 'prompted', 'prompted',
            'prompted', 'prompted', 'prompted',
        ],
        activitiesSummary: [
            {
                activityId: 'stim-3',
                activityName: 'Estimular comunicação verbal',
                counts: {
                    naoDesempenhou: 0,
                    desempenhouComAjuda: 13, // Predominante: LARANJA
                    desempenhou: 7,
                },
                total: 20,
                durationMinutes: 25,
            },
        ],
    },
];

export const mockMusiSessionsDetailed = mockMusiSessions.map((session, index) => ({
    ...session,
    patientId: 'mock-patient-001',
    patientName: 'Alessandro Braga',
    programId: 'mock-musi-001',
    programName: 'Programa de Expressão Musical e Ritmo',
    goalTitle: 'Desenvolver habilidades de expressão musical e coordenação rítmica',
    achieved: (session.independenceRate ?? 0) >= 70 ? 'sim' : (session.independenceRate ?? 0) >= 50 ? 'parcial' : 'nao' as const,
    frequency: session.activitiesSummary?.reduce((sum, act) => sum + act.total, 0) || 0,
    durationMin: session.activitiesSummary?.reduce((sum, act) => sum + (act.durationMinutes || 0), 0) || 0,
    performanceNotes: session.observacoes || `Sessão ${6 - index}: Paciente demonstrou participação nas atividades musicais propostas.`,
    clinicalNotes: session.observacoes ? 'Evolução consistente no desenvolvimento das habilidades musicais.' : null,
}));
