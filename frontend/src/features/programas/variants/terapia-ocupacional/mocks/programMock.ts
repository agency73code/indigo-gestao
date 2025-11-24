/**
 * Mock de programa de Terapia Ocupacional para desenvolvimento
 * Este mock simula um programa completo de TO com todos os campos específicos
 */

export const mockToProgram = {
    id: 'mock-to-001',
    patientId: 'mock-patient-001',
    therapistId: 'mock-therapist-001',
    name: 'Programa de Desenvolvimento de AVDs',
    goalTitle: 'Desenvolver independência nas atividades de vida diária',
    goalDescription: 'Promover autonomia do paciente em atividades cotidianas como vestir-se, alimentar-se e higiene pessoal, utilizando adaptações e técnicas de compensação quando necessário.',
    shortTermGoalDescription: 'Aumentar a independência em atividades de autocuidado com uso de recursos adaptativos',
    currentPerformanceLevel: 'Paciente apresenta dependência moderada para atividades de vestir-se, necessitando assistência verbal e física. Consegue segurar talheres adaptados mas tem dificuldade na coordenação motora fina para manusear botões e zíperes.',
    stimuli: [
        {
            id: 'stimulus-1',
            label: 'Vestir camiseta',
            description: 'Praticar movimento de vestir camiseta utilizando técnica de vestir por cima. Iniciar com camisetas de tamanho maior e tecido mais firme. Instruções visuais coladas no espelho.',
            active: true,
            order: 1
        },
        {
            id: 'stimulus-2',
            label: 'Abotoar camisa',
            description: 'Treino de coordenação motora fina com botões grandes. Começar com placa de treino com 3 botões, progredir para 5 botões, depois praticar em camisa real. Uso de pinça adaptada se necessário.',
            active: true,
            order: 2
        },
        {
            id: 'stimulus-3',
            label: 'Uso de talher adaptado',
            description: 'Prática de alimentação com garfo e colher com cabo engrossado. Exercícios de preensão palmar e movimento de pronação/supinação. Iniciar com alimentos que não escorregam.',
            active: true,
            order: 3
        },
        {
            id: 'stimulus-4',
            label: 'Escovação dental',
            description: 'Sequenciamento da atividade de escovação com apoio visual (cartões de sequência). Escova com cabo adaptado e adaptação no tubo de pasta de dente para facilitar abertura.',
            active: true,
            order: 4
        }
    ],
    stimuliApplicationDescription: '', // TO não usa este campo
    criteria: '', // TO não usa critérios de aprendizagem
    notes: 'Paciente responde bem a estímulos visuais. Importante manter rotina consistente. Família colaborativa e participativa no processo terapêutico. Considerar progressão para atividades mais complexas após dominar estas tarefas básicas.',
    status: 'active' as const,
    createdAt: '2025-11-15T10:00:00.000Z',
    prazoInicio: '2025-11-15',
    prazoFim: '2026-02-15',
    patient: {
        id: 'mock-patient-001',
        name: 'Alessandro Martins',
        guardianName: 'Rafael Albuquerque',
        age: 4,
        photoUrl: null
    },
    therapist: {
        id: 'mock-therapist-001',
        name: 'João Batista',
        photoUrl: null,
        especialidade: 'Terapia Ocupacional'
    }
};

export type MockToProgram = typeof mockToProgram;
