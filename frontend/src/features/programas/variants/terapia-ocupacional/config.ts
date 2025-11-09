// Configuração da variação Terapia Ocupacional (TO)
// Rotas, labels e configurações específicas

export const toConfig = {
    area: 'TO',
    label: 'Terapia Ocupacional',
    slug: 'terapia-ocupacional',
    description: 'Programas e objetivos de Terapia Ocupacional',
    
    routes: {
        hub: '/app/programas/terapia-ocupacional',
        
        // OLP (Objetivo de Longo Prazo)
        createOlp: '/app/programas/terapia-ocupacional/olp/novo',
        editOlp: (id: string) => `/app/programas/terapia-ocupacional/olp/${id}/editar`,
        
        // OCP (Objetivo de Curto Prazo)
        createOcp: '/app/programas/terapia-ocupacional/ocp/novo',
        editOcp: (id: string) => `/app/programas/terapia-ocupacional/ocp/${id}/editar`,
        
        // Sessões
        registerSession: '/app/programas/terapia-ocupacional/sessoes/registrar',
        listSessions: '/app/programas/terapia-ocupacional/sessoes',
        
        // Detalhe
        programDetail: (id: string) => `/app/programas/terapia-ocupacional/programa/${id}`,
    },
    
    breadcrumbs: {
        root: 'Programas',
        area: 'Terapia Ocupacional',
    },
};
