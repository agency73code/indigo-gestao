/**
 * Mock de programa de Musicoterapia para desenvolvimento
 * Este mock simula um programa completo de Musicoterapia com todos os campos específicos
 */

export const mockMusiProgram = {
    id: 'mock-musi-001',
    patientId: 'mock-patient-001',
    therapistId: 'mock-therapist-001',
    name: 'Programa de Expressão Musical e Ritmo',
    goalTitle: 'Desenvolver habilidades de expressão musical e coordenação rítmica',
    goalDescription: 'Promover a expressão emocional e comunicação do paciente através de atividades musicais, desenvolvendo coordenação motora, ritmo, atenção compartilhada e interação social utilizando instrumentos musicais e canto.',
    shortTermGoalDescription: 'Aumentar a participação ativa em atividades musicais estruturadas com uso de instrumentos de percussão simples',
    currentPerformanceLevel: 'Paciente demonstra interesse por sons musicais, mas apresenta dificuldade em manter atenção por períodos prolongados. Consegue bater palmas seguindo ritmo simples por alguns segundos. Mostra preferência por sons graves e instrumentos de percussão.',
    stimuli: [
        {
            id: 'stim-1',
            label: 'Exploração de instrumentos',
            description: 'Apresentar diferentes instrumentos musicais (tambor, chocalho, pandeiro) e observar preferências. Permitir exploração livre e orientada dos sons produzidos.',
            active: true,
            order: 1
        },
        {
            id: 'stim-2',
            label: 'Acompanhamento rítmico simples',
            description: 'Tocar ritmo básico e incentivar imitação. Usar músicas familiares com batida marcada. Iniciar com 2-4 batidas e aumentar gradualmente.',
            active: true,
            order: 2
        },
        {
            id: 'stim-3',
            label: 'Canto com gestos',
            description: 'Cantar músicas infantis conhecidas acompanhadas de gestos. Incentivar participação vocal e motora. Usar repetição para facilitar memorização.',
            active: true,
            order: 3
        },
        {
            id: 'stim-4',
            label: 'Parar e seguir',
            description: 'Exercício de atenção e controle motor: tocar instrumento enquanto música toca, parar quando música para. Desenvolve atenção e regulação.',
            active: true,
            order: 4
        }
    ],
    stimuliApplicationDescription: '',
    criteria: '',
    notes: 'Paciente responde muito bem a músicas com batida forte e previsível. Preferência por tambor e chocalho. Evitar ambientes com muito ruído de fundo. Família relata que em casa também demonstra interesse por música.',
    status: 'active' as const,
    createdAt: '2025-11-20T10:00:00.000Z',
    prazoInicio: '2025-11-20',
    prazoFim: '2026-03-20',
    patient: {
        id: 'mock-patient-001',
        name: 'Alessandro Martins',
        guardianName: 'Rafael Albuquerque',
        age: 4,
        photoUrl: null
    },
    therapist: {
        id: 'mock-therapist-001',
        name: 'Mariana Santos',
        photoUrl: null,
        especialidade: 'Musicoterapia'
    }
};

export type MockMusiProgram = typeof mockMusiProgram;
