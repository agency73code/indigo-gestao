import type { ProgramDetail } from '../types';

export const mockProgramDetail: ProgramDetail = {
    id: 'prog-123',
    name: 'Programa de Desenvolvimento da Linguagem',
    patientId: 'pat-456',
    patientName: 'Maria Silva Santos',
    patientGuardian: 'Ana Silva Santos',
    patientAge: 8,
    patientPhotoUrl: null,
    therapistId: 'ther-789',
    therapistName: 'Dra. Juliana Oliveira',
    createdAt: '2025-01-15T10:30:00.000Z',
    prazoInicio: '2025-01-15T10:30:00.000Z',
    prazoFim: '2025-04-15T10:30:00.000Z',
    goalTitle: 'Desenvolvimento da comunicação verbal e não verbal',
    longTermGoalDescription:
        'Promover avanços graduais na comunicação funcional da paciente, integrando recursos verbais e não verbais em interações sociais cotidianas.',
    shortTermGoalDescription:
        'Garantir que a paciente responda a comandos simples e utilize ao menos três formas de comunicação funcional (fala, gestos ou figuras) em contextos estruturados.',
    goalDescription:
        'Promover avanços graduais na comunicação funcional da paciente, integrando recursos verbais e não verbais em interações sociais cotidianas.',
    stimuliApplicationDescription:
        'Aplique os estímulos nas sessões diárias, utilizando reforçadores preferidos e alternando contextos (sala, pátio e refeitório) para favorecer a generalização.',
    criteria:
        '✓ 80% de acertos em três sessões consecutivas\n✓ Independência total em cinco apresentações\n✓ Manutenção por duas semanas sem treino',
    notes:
        'Paciente apresenta maior engajamento com recursos visuais. Priorizar sessões no período da manhã e envolver responsáveis na generalização dos estímulos.',
    stimuli: [
        {
            id: 'stim-1',
            order: 1,
            label: 'Identificação de objetos',
            description:
                'Apresentar objetos do cotidiano e solicitar que a paciente aponte ou nomeie o item indicado.',
            active: true,
        },
        {
            id: 'stim-2',
            order: 2,
            label: 'Imitação de gestos',
            description:
                'Trabalhar imitação de gestos funcionais (acenar, bater palmas, apontar) iniciando com movimentos amplos.',
            active: true,
        },
        {
            id: 'stim-3',
            order: 3,
            label: 'Seguir comandos simples',
            description:
                'Utilizar comandos de uma etapa e evoluir gradualmente para comandos com duas etapas em sequência.',
            active: true,
        },
        {
            id: 'stim-4',
            order: 4,
            label: 'Expressão de necessidades',
            description:
                'Ensinar formas objetivas de expressar necessidades básicas usando palavras, gestos ou figuras.',
            active: false,
        },
    ],
    status: 'active',
};
