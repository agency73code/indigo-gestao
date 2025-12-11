import type { BaseProgramPageConfig } from '../../core/types';

/**
 * Configuração de textos e labels para Fisioterapia/Psicomotricidade/Educação Física
 * Modelo compartilhado entre as três áreas
 */
export const fisioProgramConfig: BaseProgramPageConfig = {
    pageTitle: 'Novo Objetivo',
    
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
        therapist: 'Terapeuta',
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
        notes: 'Observações adicionais sobre o programa de Fisio...',
    },
    
    buttons: {
        save: 'Salvar Programa',
        saveAndStart: 'Salvar e Iniciar Sessão',
        cancel: 'Cancelar',
    },
    
    messages: {
        saveSuccess: 'Programa de Fisio criado com sucesso!',
        saveError: 'Erro ao salvar programa de Fisio',
        confirmLeave: 'Você tem alterações não salvas. Tem certeza que deseja sair?',
    },

    features: {
        showCriteria: false,
        showStimulusDescription: true,
        showStimuliApplication: false,
        showCurrentPerformance: false,
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
 * Rotas base que não alteram o contexto da área
 * Usadas por Fisioterapia, Psicomotricidade e Educação Física
 */
export const fisioBaseRoutes = {
    create: '/app/programas/novo-fisio',
    list: '/app/programas/lista',
    detail: (id: string) => `/app/programas/fisioterapia/programa/${id}`,
    edit: (id: string) => `/app/programas/fisioterapia/ocp/${id}/editar`,
    newSession: (programId: string, patientId: string) => 
        `/app/programas/sessoes-fisio/registrar?programaId=${programId}&patientId=${patientId}`,
    sessions: '/app/programas/sessoes/consultar',
    sessionDetail: (id: string) => `/app/programas/sessoes-fisio/${id}`,
};

/**
 * Configuração de rotas para Fisioterapia (legado)
 */
export const fisioRoutes = {
    hub: '/app/programas/fisioterapia',
    list: '/app/programas/fisioterapia/consultar',
    create: '/app/programas/fisioterapia/ocp/novo',
    detail: (id: string) => `/app/programas/fisioterapia/programa/${id}`,
    edit: (id: string) => `/app/programas/fisioterapia/ocp/${id}/editar`,
    newSession: (programId: string, patientId: string) => 
        `/app/programas/fisioterapia/sessoes/registrar?programaId=${programId}&patientId=${patientId}`,
    sessions: '/app/programas/fisioterapia/sessoes',
    sessionDetail: (id: string) => `/app/programas/fisioterapia/sessoes/${id}`,
};

/**
 * Configuração antiga (manter para compatibilidade temporária)
 */
export const fisioConfig = {
    area: 'FISIO',
    label: 'Fisioterapia',
    slug: 'fisioterapia',
    description: 'Programas e objetivos de Fisioterapia',
    
    routes: fisioRoutes,
    
    breadcrumbs: {
        root: 'Programas',
        area: 'Fisioterapia',
    },
};

