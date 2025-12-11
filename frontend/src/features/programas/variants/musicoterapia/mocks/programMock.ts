/**
 * Mock de programa de Musicoterapia para desenvolvimento
 * Este mock simula um programa completo de Musicoterapia com todos os campos específicos
 * 
 * ESTRUTURA DO PROGRAMA DE MUSICOTERAPIA:
 * - Objetivo Geral (name + goalDescription)
 * - Objetivo a Curto Prazo (shortTermGoalDescription)
 * - Objetivos Específicos (stimuli) com 4 campos cada:
 *   1. Objetivo (label no backend)
 *   2. Objetivo Específico (description no backend)
 *   3. Métodos (metodos - campo adicional)
 *   4. Técnicas/Procedimentos (tecnicasProcedimentos - campo adicional)
 */

export const mockMusiProgram = {
    id: 'mock-musi-001',
    patientId: 'mock-patient-001',
    therapistId: 'mock-therapist-001',
    patientName: 'Alessandro Braga',
    patientPhotoUrl: null,
    therapistName: 'Mariana Santos',
    therapistPhotoUrl: null,
    name: 'Programa de Expressão Musical e Ritmo',
    goalTitle: 'Desenvolver habilidades de expressão musical e coordenação rítmica',
    goalDescription: 'Promover a expressão emocional e comunicação do paciente através de atividades musicais, desenvolvendo coordenação motora, ritmo, atenção compartilhada e interação social utilizando instrumentos musicais e canto.',
    shortTermGoalDescription: 'Aumentar a participação ativa em atividades musicais estruturadas com uso de instrumentos de percussão simples, desenvolvendo habilidades rítmicas básicas e interação social através da música.',
    stimuli: [
        {
            id: 'stim-1',
            label: 'Compreender conceitos espaciais',
            description: 'Identificar direita e esquerda através de atividades musicais',
            active: true,
            order: 1,
            metodos: 'Recriação – Jogos e atividades musicais',
            tecnicasProcedimentos: 'Utilizar instrumentos de percussão (tambor, chocalho) posicionados à direita e esquerda do paciente. Cantar músicas que indiquem direção (ex: "bate palma à direita"). Iniciar com demonstração visual clara, depois apenas comando verbal. Repetir sequências rítmicas simples para fixação do conceito.'
        },
        {
            id: 'stim-2',
            label: 'Desenvolver coordenação motora',
            description: 'Executar movimentos rítmicos coordenados com instrumentos musicais',
            active: true,
            order: 2,
            metodos: 'Improvisação – Expressão livre e estruturada',
            tecnicasProcedimentos: 'Propor sequências rítmicas progressivas: 1) Bater em um tambor com uma mão; 2) Alternar mãos; 3) Combinar com movimento de pés. Usar músicas com batida marcada (120 bpm). Permitir exploração livre intercalada com imitação guiada. Sessões de 10-15 minutos com pausas.'
        },
        {
            id: 'stim-3',
            label: 'Estimular comunicação verbal',
            description: 'Produzir vocalizações e palavras através de canções',
            active: true,
            order: 3,
            metodos: 'Canto terapêutico – Canções infantis conhecidas',
            tecnicasProcedimentos: 'Selecionar músicas familiares ao repertório da criança. Cantar junto fazendo pausas estratégicas para a criança completar palavras-chave. Usar gestos ilustrativos sincronizados. Repetir mesmas músicas por 3-4 sessões antes de introduzir novas. Valorizar qualquer tentativa de vocalização.'
        },
        {
            id: 'stim-4',
            label: 'Promover regulação emocional',
            description: 'Reconhecer e expressar emoções através da música',
            active: true,
            order: 4,
            metodos: 'Audição musical – Escuta ativa e reflexiva',
            tecnicasProcedimentos: 'Apresentar músicas com diferentes características emocionais (alegre, calma, energética). Usar cartões visuais de emoções para correlação. Propor atividades de "pintar o que a música faz sentir". Dialogar sobre as sensações após cada música. Criar playlist personalizada com músicas que acalmam o paciente.'
        }
    ],
    stimuliApplicationDescription: '',
    criteria: '',
    notes: 'Paciente responde muito bem a músicas com batida forte e previsível. Preferência por tambor e chocalho. Evitar ambientes com muito ruído de fundo. Família relata que em casa também demonstra interesse por música. Importante manter estrutura previsível das sessões para gerar sensação de segurança.',
    status: 'active' as const,
    createdAt: '2025-11-20T10:00:00.000Z',
    prazoInicio: '2025-11-20',
    prazoFim: '2026-03-20',
    patient: {
        id: 'mock-patient-001',
        name: 'Alessandro Braga',
        guardianName: 'Caio Oliveira',
        age: 7,
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
