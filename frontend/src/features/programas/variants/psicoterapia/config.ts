/**
 * Configuração de rotas e textos para Psicoterapia
 */

import type { BaseProgramPageConfig } from '../../core/types';

/**
 * Configuração de textos e labels para Psicoterapia
 */
export const psicoterapiaConfig: BaseProgramPageConfig = {
    pageTitle: 'Prontuário Psicológico',
    
    labels: {
        programName: 'Prontuário',
        goalTitle: 'Objetivo Terapêutico',
        goalDescription: 'Descrição do Objetivo',
        shortTermGoal: 'Metas de Curto Prazo',
        stimuli: 'Intervenções',
        stimuliApplication: 'Descrição das Intervenções',
        criteria: 'Critérios de Avaliação',
        notes: 'Observações',
        patient: 'Cliente',
        therapist: 'Terapeuta',
        dateStart: 'Data de Início',
        dateEnd: 'Data de Fim',
    },
    
    placeholders: {
        programName: 'Ex: Prontuário de Acompanhamento',
        goalTitle: 'Ex: Desenvolvimento de habilidades sociais',
        goalDescription: 'Descreva os objetivos terapêuticos...',
        shortTermGoal: 'Metas específicas para o período...',
        stimuliApplication: 'Como as intervenções serão aplicadas...',
        criteria: 'Como será avaliado o progresso...',
        notes: 'Observações adicionais...',
    },
    
    buttons: {
        save: 'Salvar Prontuário',
        saveAndStart: 'Salvar e Registrar Evolução',
        cancel: 'Cancelar',
    },
    
    messages: {
        saveSuccess: 'Prontuário salvo com sucesso!',
        saveError: 'Erro ao salvar prontuário',
        confirmLeave: 'Você tem alterações não salvas. Tem certeza que deseja sair?',
    },

    sectionTitles: {
        programInfo: 'Informações do Prontuário',
        goal: 'Objetivos Terapêuticos',
    },
};

/**
 * Configuração de rotas para Psicoterapia
 */
export const psicoterapiaRoutes = {
    hub: '/app/programas/psicoterapia',
    cadastrar: '/app/programas/psicoterapia/cadastrar',
    consultar: '/app/programas/psicoterapia/consultar',
    detalhe: (id: string) => `/app/programas/psicoterapia/prontuario/${id}`,
    editar: (id: string) => `/app/programas/psicoterapia/editar/${id}`,
    novaEvolucao: (prontuarioId: string) => `/app/programas/psicoterapia/prontuario/${prontuarioId}?nova=true`,
};
