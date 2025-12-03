import type { BaseProgramPageConfig } from '../../core/types';

/**
 * Configuração de textos e labels para Musicoterapia
 */
export const musiProgramConfig: BaseProgramPageConfig = {
    pageTitle: 'Novo Objetivo - Musicoterapia',
    
    labels: {
        programName: 'Nome do Programa',
        goalTitle: 'Título do Objetivo',
        goalDescription: 'Descrição do Objetivo a Longo Prazo',
        shortTermGoal: 'Descrição Detalhada do Objetivo a Curto Prazo',
        stimuli: 'Atividades',
        stimuliApplication: 'Descrição da Aplicação das Atividades',
        criteria: 'Critério de Aprendizagem',
        notes: 'Observações Gerais',
        patient: 'Cliente',
        therapist: 'Musicoterapeuta',
        dateStart: 'Data de Início',
        dateEnd: 'Data de Fim',
    },
    
    placeholders: {
        programName: 'Ex: Programa de desenvolvimento musical',
        goalTitle: 'Ex: Desenvolver expressão musical e ritmo',
        goalDescription: 'Descreva o objetivo principal de Musicoterapia...',
        shortTermGoal: 'Descreva as metas específicas de curto prazo...',
        stimuliApplication: 'Como as atividades serão aplicadas...',
        criteria: 'Critérios para considerar o objetivo alcançado...',
        notes: 'Observações adicionais sobre o programa de Musicoterapia...',
    },
    
    buttons: {
        save: 'Salvar Programa',
        saveAndStart: 'Salvar e Iniciar Sessão',
        cancel: 'Cancelar',
    },
    
    messages: {
        saveSuccess: 'Programa de Musicoterapia criado com sucesso!',
        saveError: 'Erro ao salvar programa de Musicoterapia',
        confirmLeave: 'Você tem alterações não salvas. Tem certeza que deseja sair?',
    },

    features: {
        showCriteria: false,
        showStimulusDescription: true,
        showStimuliApplication: false,
        showCurrentPerformance: true,
    },

    sectionTitles: {
        programInfo: 'Informações do Objetivo Geral',
        goal: 'Objetivo Geral',
        currentPerformance: 'Nível atual de Desempenho',
        stimuli: 'Objetivo Específico',
        notes: 'Observações do Terapeuta',
    },
};

/**
 * Configuração de rotas para Musicoterapia
 */
export const musiRoutes = {
    hub: '/app/programas/musicoterapia',
    list: '/app/programas/musicoterapia/consultar',
    create: '/app/programas/musicoterapia/ocp/novo',
    detail: (id: string) => `/app/programas/musicoterapia/programa/${id}`,
    edit: (id: string) => `/app/programas/musicoterapia/ocp/${id}/editar`,
    newSession: (programId: string, patientId: string) => 
        `/app/programas/musicoterapia/sessoes/registrar?programaId=${programId}&patientId=${patientId}`,
    sessions: '/app/programas/musicoterapia/sessoes',
    sessionDetail: (id: string) => `/app/programas/musicoterapia/sessoes/${id}`,
};

/**
 * Configuração da área (manter para compatibilidade)
 */
export const musiConfig = {
    area: 'MUSI',
    label: 'Musicoterapia',
    slug: 'musicoterapia',
    description: 'Programas e objetivos de Musicoterapia',
    
    routes: musiRoutes,
    
    breadcrumbs: {
        root: 'Programas',
        area: 'Musicoterapia',
    },
};

// Re-export para manter compatibilidade
export const areaConfig = {
    id: 'musicoterapia',
    name: 'Musicoterapia',
    description: 'Configurações específicas para programas de Musicoterapia',
};
