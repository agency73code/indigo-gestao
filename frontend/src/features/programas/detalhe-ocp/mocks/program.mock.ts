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
    goalTitle: 'Desenvolvimento da comunicação verbal e não-verbal',
    goalDescription: 'O objetivo principal é desenvolver as habilidades de comunicação da paciente, trabalhando expressão verbal, compreensão de comandos simples e uso de gestos funcionais para comunicação básica.',
    stimuli: [
        {
            id: 'stim-1',
            order: 1,
            label: 'Identificação de objetos',
            description: 'Apresentar objetos comuns do dia a dia e solicitar que a criança aponte ou nomeie o objeto apresentado. Utilizar brinquedos, utensílios domésticos e alimentos.',
            active: true
        },
        {
            id: 'stim-2',
            order: 2,
            label: 'Imitação de gestos',
            description: 'Trabalhar a imitação de gestos simples como acenar, bater palmas, apontar. Começar com gestos grossos e evoluir para gestos mais finos.',
            active: true
        },
        {
            id: 'stim-3',
            order: 3,
            label: 'Seguir comandos simples',
            description: 'Comandos de uma etapa como "pega a bola", "senta aqui", "vem cá". Evoluir gradualmente para comandos de duas etapas.',
            active: true
        },
        {
            id: 'stim-4',
            order: 4,
            label: 'Expressão de necessidades',
            description: 'Ensinar formas funcionais de expressar necessidades básicas como fome, sede, vontade de brincar, usando palavras, gestos ou símbolos.',
            active: false
        }
    ],
    status: 'active'
};