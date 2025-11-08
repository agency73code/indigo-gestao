// Service único para sessões TO (mock, sem back-end)
// Futuramente, trocar mock por fetch mantendo a interface

import type { ToSessionPayload, ToSessionResponse, ToSessionListItem, ToSessionDetail } from '../types';

// ============ MOCK DATA ============
// Simulação de dados persistentes (localStorage como "banco")
const STORAGE_KEY = 'to_sessions_mock';

function getSessionsFromStorage(): ToSessionDetail[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveSessionsToStorage(sessions: ToSessionDetail[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (err) {
        console.error('[TO Sessions] Erro ao salvar no localStorage:', err);
    }
}

// Mock: dados iniciais se não houver nada no storage
function initializeMockData() {
    const existing = getSessionsFromStorage();
    
    // Verifica se já tem sessões do Alessandro, se não, reinicializa
    const hasAlessandroSessions = existing.some(s => s.patientId === 'b6f174c5-87bc-4946-9bff-2eaf72d977b9');
    if (existing.length > 0 && hasAlessandroSessions) return;

    const mockSessions: ToSessionDetail[] = [
        // Sessões para Alessandro Martins (ID real do sistema)
        {
            id: 'to-session-am-1',
            date: new Date(2025, 10, 7).toISOString(),
            patientId: 'b6f174c5-87bc-4946-9bff-2eaf72d977b9',
            patientName: 'Alessandro Martins',
            patientAge: 4,
            patientGuardianName: 'Rafael Albuquerque',
            therapistId: '1',
            therapistName: 'Dra. Juliana Oliveira',
            programId: 'prog-to-am-1',
            programName: 'Programa de Integração Sensorial',
            goalTitle: 'Desenvolver tolerância a diferentes texturas e estímulos táteis',
            goalDescription: 'Trabalhar a aceitação gradual de texturas variadas através de brincadeiras sensoriais',
            achieved: 'sim',
            frequency: 6,
            durationMin: 35,
            performanceNotes: 'Alessandro apresentou excelente progresso na sessão de hoje. Conseguiu manipular objetos com diferentes texturas (lixa, algodão, massinha) por períodos de até 5 minutos sem demonstrar sinais de desconforto significativo. Iniciou as atividades com leve resistência, mas após o aquecimento com atividades preferidas, engajou-se plenamente. Demonstrou interesse especial pela massinha de modelar, criando formas simples com autonomia. Manteve regulação emocional adequada durante toda a sessão.',
            clinicalNotes: 'Progressão notável desde a última avaliação. Família relatou que Alessandro tem aceitado melhor alimentos com texturas diferentes em casa. Recomenda-se continuar com atividades graduais de exploração sensorial. Próxima etapa: introduzir texturas úmidas de forma lúdica.',
            attachments: [
                {
                    url: '/mock/files/registro-sensorial-nov2025.pdf',
                    name: 'Registro de Evolução Sensorial.pdf',
                    type: 'Relatório',
                },
            ],
        },
        {
            id: 'to-session-am-2',
            date: new Date(2025, 10, 1).toISOString(),
            patientId: 'b6f174c5-87bc-4946-9bff-2eaf72d977b9',
            patientName: 'Alessandro Martins',
            patientAge: 4,
            patientGuardianName: 'Rafael Albuquerque',
            therapistId: '1',
            therapistName: 'Dra. Juliana Oliveira',
            programId: 'prog-to-am-1',
            programName: 'Programa de Integração Sensorial',
            goalTitle: 'Desenvolver tolerância a diferentes texturas e estímulos táteis',
            goalDescription: 'Trabalhar a aceitação gradual de texturas variadas através de brincadeiras sensoriais',
            achieved: 'parcial',
            frequency: 3,
            durationMin: 25,
            performanceNotes: 'Alessandro demonstrou avanços, porém ainda com necessidade de suporte. Conseguiu tocar 3 das 6 texturas apresentadas, mantendo contato por períodos curtos (1-2 minutos). Demonstrou comportamento de esquiva em texturas pegajosas, necessitando de apoio verbal e modelagem. Respondeu bem ao uso de reforçadores visuais (timer e quadro de recompensas). Necessitou de pausas regulatórias durante a atividade.',
            clinicalNotes: 'Sessão desafiadora devido ao estado de alerta aumentado no início. Alessandro chegou agitado da escola. Sugere-se protocolo de regulação inicial mais extenso nas próximas sessões. Família orientada sobre estratégias de preparação pré-sessão.',
        },
        {
            id: 'to-session-am-3',
            date: new Date(2025, 9, 24).toISOString(),
            patientId: 'b6f174c5-87bc-4946-9bff-2eaf72d977b9',
            patientName: 'Alessandro Martins',
            patientAge: 4,
            patientGuardianName: 'Rafael Albuquerque',
            therapistId: '1',
            therapistName: 'Dra. Juliana Oliveira',
            programId: 'prog-to-am-2',
            programName: 'Desenvolvimento de Habilidades de Autocuidado',
            goalTitle: 'Melhorar independência em atividades de vida diária',
            goalDescription: 'Treinar sequência de lavagem de mãos e escovação de dentes com apoio visual',
            achieved: 'sim',
            frequency: 8,
            durationMin: 30,
            performanceNotes: 'Desempenho excelente na atividade de autocuidado. Alessandro conseguiu completar toda a sequência de lavagem de mãos com apoio visual mínimo, demonstrando memorização das etapas. Realizou 8 repetições durante a sessão, sendo as últimas 3 com total independência. Demonstrou orgulho ao completar a tarefa, solicitando mostrar para o responsável. Manteve atenção e engajamento durante todo o período proposto.',
            clinicalNotes: 'Família pode iniciar generalização da habilidade em casa. Orientado uso do mesmo apoio visual utilizado na terapia. Alessandro está pronto para avançar para próxima meta: vestir-se com supervisão mínima.',
            attachments: [
                {
                    url: '/mock/files/sequencia-visual-lavagem-maos.pdf',
                    name: 'Sequência Visual - Lavar Mãos.pdf',
                    type: 'Material Terapêutico',
                },
                {
                    url: '/mock/files/evolucao-autocuidado.pdf',
                    name: 'Evolução - Autocuidado.pdf',
                    type: 'Relatório',
                },
            ],
        },
        // Sessões para Maxine Ferry (para compatibilidade)
        {
            id: 'to-session-1',
            date: new Date(2025, 10, 5).toISOString(),
            patientId: '1',
            patientName: 'Maxine Ferry',
            patientAge: 39,
            patientGuardianName: 'Maria Ferry',
            therapistId: '1',
            therapistName: 'Dra. Juliana Oliveira',
            programId: 'prog-to-1',
            programName: 'Programa de Habilidades Sociais',
            goalTitle: 'Desenvolvimento da comunicação verbal e não verbal',
            goalDescription: 'Trabalhar expressão facial, contato visual e linguagem corporal em contextos sociais',
            achieved: 'sim',
            frequency: 8,
            durationMin: 45,
            performanceNotes: 'Cliente demonstrou excelente progresso na sessão de hoje. Conseguiu manter contato visual por períodos mais longos (média de 15 segundos) e iniciou interações sociais de forma espontânea em 3 situações diferentes. Utilizou adequadamente expressões faciais para demonstrar emoções durante atividades lúdicas. Respondeu positivamente aos reforçadores sociais (elogios verbais) e manteve-se engajado durante toda a atividade proposta.',
            clinicalNotes: 'Recomenda-se manter o mesmo tipo de atividade nas próximas sessões, aumentando gradualmente a complexidade das interações sociais. Considerar introduzir situações com mais de um interlocutor nas próximas 2 semanas. Família relatou melhora significativa no contexto doméstico, com criança iniciando conversas durante as refeições.',
            attachments: [
                {
                    url: '/mock/files/avaliacao-to-nov2025.pdf',
                    name: 'Avaliação TO - Novembro 2025.pdf',
                    type: 'Avaliação',
                },
                {
                    url: '/mock/files/registro-fotografico-sessao.jpg',
                    name: 'Registro Fotográfico da Sessão.jpg',
                    type: 'Registro',
                },
            ],
        },
        {
            id: 'to-session-2',
            date: new Date(2025, 9, 28).toISOString(),
            patientId: '1',
            patientName: 'Maxine Ferry',
            patientAge: 39,
            patientGuardianName: 'Maria Ferry',
            therapistId: '1',
            therapistName: 'Dra. Juliana Oliveira',
            programId: 'prog-to-1',
            programName: 'Programa de Habilidades Sociais',
            goalTitle: 'Desenvolvimento da comunicação verbal e não verbal',
            goalDescription: 'Trabalhar expressão facial, contato visual e linguagem corporal em contextos sociais',
            achieved: 'parcial',
            frequency: 5,
            durationMin: 30,
            performanceNotes: 'Cliente apresentou dificuldade em manter contato visual consistente durante a sessão. Conseguiu realizar o objetivo parcialmente, com necessidade de apoio verbal constante. Demonstrou interesse nas atividades propostas, mas houve momentos de dispersão. Utilizou algumas expressões faciais apropriadas quando solicitado, porém ainda necessita de modelo visual para executar a tarefa.',
            clinicalNotes: 'Sessão realizada em ambiente com mais estímulos visuais que o habitual, o que pode ter contribuído para a dispersão. Sugere-se retomar atividades em ambiente controlado nas próximas sessões. Família orientada sobre estratégias para praticar em casa.',
        },
        {
            id: 'to-session-3',
            date: new Date(2025, 9, 21).toISOString(),
            patientId: '1',
            patientName: 'Maxine Ferry',
            patientAge: 39,
            patientGuardianName: 'Maria Ferry',
            therapistId: '1',
            therapistName: 'Dra. Juliana Oliveira',
            programId: 'prog-to-2',
            programName: 'Coordenação Motora Fina',
            goalTitle: 'Aprimorar preensão em pinça e coordenação bimanual',
            goalDescription: 'Atividades de encaixe, recorte e desenho para desenvolver habilidades motoras finas',
            achieved: 'sim',
            frequency: 12,
            durationMin: 40,
            performanceNotes: 'Excelente desempenho nas atividades de coordenação motora fina. Cliente conseguiu realizar todos os encaixes propostos (12/12) com preensão em pinça adequada. Demonstrou melhora significativa na força de preensão e na precisão dos movimentos. Atividade de recorte realizada com autonomia, seguindo as linhas tracejadas com boa precisão. Manteve postura adequada durante toda a atividade.',
            clinicalNotes: 'Progressão notável desde a última avaliação. Cliente está pronto para avançar para atividades com objetos menores e que exijam maior precisão. Família orientada sobre atividades para estimulação em casa.',
            attachments: [
                {
                    url: '/mock/files/evolucao-coordenacao.pdf',
                    name: 'Relatório de Evolução - Coordenação.pdf',
                    type: 'Relatório',
                },
            ],
        },
    ];

    saveSessionsToStorage(mockSessions);
}

// Inicializar dados mock
initializeMockData();

// ============ SERVICE ============

export type SaveToSessionParams = ToSessionPayload;

export const toSessionsService = {
    /**
     * Salva uma nova sessão TO
     * Mock: simula latency e persiste no localStorage
     */
    save: async (data: SaveToSessionParams): Promise<ToSessionResponse> => {
        // Simular latency de rede (400ms)
        await new Promise(resolve => setTimeout(resolve, 400));

        // Mock: validação básica
        if (!data.patientId) {
            throw new Error('Paciente obrigatório');
        }
        if (!data.goalTitle || data.goalTitle.trim().length === 0) {
            throw new Error('Título do objetivo obrigatório');
        }
        if (!data.achieved) {
            throw new Error('Campo "Conseguiu?" obrigatório');
        }
        if (!data.performanceNotes || data.performanceNotes.trim().length < 10) {
            throw new Error('Descrição do desempenho deve ter no mínimo 10 caracteres');
        }

        // Mock: criar nova sessão e salvar
        const newSession: ToSessionDetail = {
            id: `to-session-${Date.now()}`,
            date: data.date,
            patientId: data.patientId,
            patientName: 'Paciente Mock', // Mock: buscar do data.patient se necessário
            therapistId: data.therapistId || 'terapeuta-1',
            therapistName: 'Terapeuta Atual',
            programId: data.programId || 'prog-to-1',
            programName: 'Programa TO', // Mock: buscar do data.program se necessário
            goalTitle: data.goalTitle,
            goalDescription: undefined, // Mock: não vem no payload
            achieved: data.achieved,
            frequency: data.frequency,
            durationMin: data.durationMin,
            performanceNotes: data.performanceNotes,
            clinicalNotes: data.clinicalNotes,
            attachments: data.attachments?.map((file, idx) => ({
                url: typeof file === 'string' ? file : URL.createObjectURL(file),
                name: typeof file === 'string' ? `arquivo-${idx + 1}` : file.name,
                type: data.documentType || 'Documento',
            })),
        };

        const sessions = getSessionsFromStorage();
        sessions.unshift(newSession); // Adiciona no início (mais recente primeiro)
        saveSessionsToStorage(sessions);
        
        console.log('[TO Sessions Service] Sessão salva (mock):', newSession);

        return {
            id: newSession.id,
            success: true,
            message: 'Sessão registrada com sucesso',
        };
    },

    /**
     * Lista sessões TO por paciente (mock)
     * Futuramente: endpoint GET /api/to-sessions?patientId=...
     */
    listByPatient: async (patientId: string): Promise<ToSessionListItem[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log('[TO Sessions Service] Listando sessões do paciente (mock):', patientId);
        
        const allSessions = getSessionsFromStorage();
        console.log('[TO Sessions Service] Total de sessões no storage:', allSessions.length);
        console.log('[TO Sessions Service] IDs de pacientes disponíveis:', [...new Set(allSessions.map(s => s.patientId))]);
        
        const patientSessions = allSessions.filter(s => s.patientId === patientId);
        console.log('[TO Sessions Service] Sessões encontradas para este paciente:', patientSessions.length);
        
        // Converter para ToSessionListItem
        const listItems: ToSessionListItem[] = patientSessions.map(session => ({
            id: session.id,
            date: session.date,
            patientId: session.patientId,
            patientName: session.patientName,
            therapistId: session.therapistId,
            therapistName: session.therapistName,
            programName: session.programName,
            goalTitle: session.goalTitle,
            achieved: session.achieved,
            frequency: session.frequency,
            durationMin: session.durationMin,
        }));
        
        // Ordenar por data (mais recentes primeiro)
        listItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return listItems;
    },

    /**
     * Busca detalhes de uma sessão TO (mock)
     * Futuramente: endpoint GET /api/to-sessions/:id
     */
    getById: async (sessionId: string): Promise<ToSessionDetail | null> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log('[TO Sessions Service] Buscando sessão por ID (mock):', sessionId);
        
        const allSessions = getSessionsFromStorage();
        const session = allSessions.find(s => s.id === sessionId);
        
        return session || null;
    },
};

