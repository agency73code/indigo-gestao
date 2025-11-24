import type { BaseProgramPageConfig } from '../../core/types';

/**
 * Configuração de textos e labels para Fonoaudiologia
 */
export const fonoProgramConfig: BaseProgramPageConfig = {
    pageTitle: 'Novo Programa / Objetivos',
    
    labels: {
        programName: 'Nome do Programa',
        goalTitle: 'Título do Objetivo',
        goalDescription: 'Descrição do Objetivo a Longo Prazo',
        shortTermGoal: 'Descrição Detalhada do Objetivo a Curto Prazo',
        stimuli: 'Estímulos',
        stimuliApplication: 'Descrição da Aplicação dos Estímulos',
        criteria: 'Critério de Aprendizagem',
        notes: 'Observações Gerais',
        patient: 'Cliente',
        therapist: 'Terapeuta',
        dateStart: 'Data de Início',
        dateEnd: 'Data de Fim',
    },
    
    placeholders: {
        programName: 'Ex: Programa de comunicação verbal',
        goalTitle: 'Ex: Desenvolver habilidades de comunicação',
        goalDescription: 'Descreva o objetivo principal...',
        shortTermGoal: 'Descreva as metas específicas de curto prazo...',
        stimuliApplication: 'Como os estímulos serão aplicados...',
        criteria: 'Critérios para considerar o objetivo alcançado...',
        notes: 'Observações adicionais sobre o programa...',
    },
    
    buttons: {
        save: 'Salvar Programa',
        saveAndStart: 'Salvar e Iniciar Sessão',
        cancel: 'Cancelar',
    },
    
    messages: {
        saveSuccess: 'Programa criado com sucesso!',
        saveError: 'Erro ao salvar programa',
        confirmLeave: 'Você tem alterações não salvas. Tem certeza que deseja sair?',
    },

    sectionTitles: {
        programInfo: 'Informações do Programa / Objetivo',
        goal: 'Informações do Programa / Objetivo',
    },
};

/**
 * Configuração de rotas para Fonoaudiologia
 */
export const fonoRoutes = {
    hub: '/app/programas',
    list: '/app/programas/consultar',
    create: '/app/programas/novo',
    detail: (id: string) => `/app/programas/${id}`,
    edit: (id: string) => `/app/programas/${id}/editar`,
    newSession: (programId: string, patientId: string) => 
        `/app/programas/sessoes/nova?programaId=${programId}&patientId=${patientId}`,
    sessions: '/app/programas/sessoes',
    sessionDetail: (id: string) => `/app/programas/sessoes/${id}`,
};
