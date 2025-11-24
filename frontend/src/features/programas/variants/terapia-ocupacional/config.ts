import type { BaseProgramPageConfig } from '../../core/types';

/**
 * Configuração de textos e labels para Terapia Ocupacional
 */
export const toProgramConfig: BaseProgramPageConfig = {
    pageTitle: 'Novo Objetivo - Terapia Ocupacional',
    
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
        therapist: 'Terapeuta Ocupacional',
        dateStart: 'Data de Início',
        dateEnd: 'Data de Fim',
    },
    
    placeholders: {
        programName: 'Ex: Programa de desenvolvimento ocupacional',
        goalTitle: 'Ex: Desenvolver habilidades de autonomia',
        goalDescription: 'Descreva o objetivo principal de TO...',
        shortTermGoal: 'Descreva as metas específicas de curto prazo em TO...',
        stimuliApplication: 'Como as atividades serão aplicadas...',
        criteria: 'Critérios para considerar o objetivo alcançado...',
        notes: 'Observações adicionais sobre o programa de TO...',
    },
    
    buttons: {
        save: 'Salvar Programa',
        saveAndStart: 'Salvar e Iniciar Sessão',
        cancel: 'Cancelar',
    },
    
    messages: {
        saveSuccess: 'Programa de TO criado com sucesso!',
        saveError: 'Erro ao salvar programa de TO',
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
 * Configuração de rotas para Terapia Ocupacional
 */
export const toRoutes = {
    hub: '/app/programas/terapia-ocupacional',
    list: '/app/programas/terapia-ocupacional/consultar',
    create: '/app/programas/terapia-ocupacional/ocp/novo',
    detail: (id: string) => `/app/programas/terapia-ocupacional/programa/${id}`,
    edit: (id: string) => `/app/programas/terapia-ocupacional/ocp/${id}/editar`,
    newSession: (programId: string, patientId: string) => 
        `/app/programas/terapia-ocupacional/sessoes/registrar?programaId=${programId}&patientId=${patientId}`,
    sessions: '/app/programas/terapia-ocupacional/sessoes',
    sessionDetail: (id: string) => `/app/programas/terapia-ocupacional/sessoes/${id}`,
};

/**
 * Configuração antiga (manter para compatibilidade temporária)
 */
export const toConfig = {
    area: 'TO',
    label: 'Terapia Ocupacional',
    slug: 'terapia-ocupacional',
    description: 'Programas e objetivos de Terapia Ocupacional',
    
    routes: toRoutes,
    
    breadcrumbs: {
        root: 'Programas',
        area: 'Terapia Ocupacional',
    },
};

