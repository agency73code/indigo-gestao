/**
 * Mock data para Prontuário Psicológico
 * Usado enquanto o backend não está pronto
 */

import type { 
    ProntuarioPsicologico, 
    ProntuarioListItem,
    EvolucaoTerapeutica,
    MembroNucleoFamiliar,
} from '../types';

// ============================================
// MOCK - MEMBROS DO NÚCLEO FAMILIAR
// ============================================

export const mockNucleoFamiliar: MembroNucleoFamiliar[] = [
    {
        id: '1',
        nome: 'Maria Silva Santos',
        parentesco: 'Mãe',
        idade: 42,
        ocupacao: 'Professora',
    },
    {
        id: '2',
        nome: 'João Carlos Santos',
        parentesco: 'Pai',
        idade: 45,
        ocupacao: 'Engenheiro',
    },
    {
        id: '3',
        nome: 'Ana Beatriz Santos',
        parentesco: 'Irmã',
        idade: 12,
        ocupacao: 'Estudante',
    },
];

// ============================================
// MOCK - EVOLUÇÕES
// ============================================

export const mockEvolucoes: EvolucaoTerapeutica[] = [
    {
        id: '1',
        numeroSessao: 1,
        dataEvolucao: '2026-01-06',
        descricaoSessao: `Primeira sessão de acolhimento. O cliente apresentou-se de forma reservada inicialmente, demonstrando dificuldade em estabelecer contato visual. 
        
Ao longo da sessão, foi possível observar maior abertura quando abordados temas relacionados aos seus interesses (jogos e desenhos).

Queixas iniciais relatadas pela mãe: dificuldade de socialização na escola, irritabilidade em casa, resistência a mudanças na rotina.

O cliente demonstrou boa capacidade de compreensão e expressão verbal quando se sente seguro. Foram estabelecidos os primeiros acordos terapêuticos.`,
        arquivos: [],
        criadoEm: '2026-01-06T14:30:00Z',
    },
    {
        id: '2',
        numeroSessao: 2,
        dataEvolucao: '2026-01-13',
        descricaoSessao: `Segunda sessão. Cliente chegou mais à vontade, cumprimentando espontaneamente.

Utilizamos recursos lúdicos (desenho livre) para facilitar a expressão. O cliente desenhou sua família e escola, permitindo explorar seus sentimentos em relação a esses ambientes.

Observações importantes:
- Demonstrou desconforto ao falar sobre a escola
- Relatou não gostar do recreio porque "é muito barulhento"
- Expressou preferência por atividades solitárias

Encaminhamentos: Continuar trabalho de vinculação e aprofundar investigação sobre as dificuldades escolares.`,
        arquivos: [],
        criadoEm: '2026-01-13T14:30:00Z',
    },
];

// ============================================
// MOCK - PRONTUÁRIO COMPLETO
// ============================================

export const mockProntuario: ProntuarioPsicologico = {
    id: '1',
    clienteId: 'client-001',
    cliente: {
        id: 'client-001',
        nome: 'Lucas Gabriel Santos',
        dataNascimento: '2016-03-15',
        idade: '9 anos e 10 meses',
        genero: 'Masculino',
        enderecoCompleto: 'Rua das Flores, 123 - Apto 45, Jardim Primavera, São Paulo - SP',
        telefoneResidencial: '(11) 3456-7890',
        celular: '(11) 98765-4321',
        email: 'familia.santos@email.com',
    },
    terapeutaId: 'therapist-001',
    terapeuta: {
        id: 'therapist-001',
        nome: 'Dra. Carolina Mendes',
        crp: '06/123456',
    },
    informacoesEducacionais: {
        nivelEscolaridade: '4º ano do Ensino Fundamental',
        instituicaoFormacao: 'Colégio São Francisco de Assis',
        profissaoOcupacao: 'Estudante',
        observacoes: 'Histórico escolar desde 2021 na mesma instituição. Apresenta bom desempenho em matemática, mas dificuldades em atividades em grupo.',
    },
    nucleoFamiliar: mockNucleoFamiliar,
    observacoesNucleoFamiliar: 'Família nuclear, pais casados há 15 anos. Boa dinâmica familiar relatada, com comunicação aberta. Avós maternos residem próximo e participam ativamente da rotina.',
    avaliacaoDemanda: {
        encaminhadoPor: 'Escola - Coordenação Pedagógica',
        motivoBuscaAtendimento: 'Dificuldades de socialização com pares, comportamento evitativo em situações sociais, irritabilidade quando contrariado, resistência a mudanças na rotina.',
        atendimentosAnteriores: 'Acompanhamento com psicopedagoga por 6 meses em 2024. Encerrado por melhora nas questões pedagógicas.',
        observacoes: 'Há suspeita de TEA levantada pela escola, porém sem diagnóstico formal. Família relata que pediatra não identificou alterações significativas nas consultas de rotina.',
        terapiasPrevias: [
            {
                id: 'terapia-prev-001',
                profissional: 'Dra. Juliana Santos',
                especialidadeAbordagem: 'Fonoaudiologia - PECS',
                tempoIntervencao: '6 meses',
                observacao: '2 sessões semanais. Boa assiduidade. Encerrado por melhora significativa.',
                ativo: true,
                origemAnamnese: true,
            },
            {
                id: 'terapia-prev-002',
                profissional: 'Dr. Pedro Alves',
                especialidadeAbordagem: 'Terapia Ocupacional - Integração Sensorial',
                tempoIntervencao: '8 meses',
                observacao: '1 sessão semanal. Em andamento.',
                ativo: true,
                origemAnamnese: true,
            },
        ],
    },
    objetivosTrabalho: `Objetivos terapêuticos estabelecidos:

1. **Desenvolvimento de habilidades sociais**: Trabalhar estratégias para melhor interação com pares, incluindo início e manutenção de conversas, resolução de conflitos e participação em atividades grupais.

2. **Regulação emocional**: Desenvolver repertório de estratégias para lidar com frustração, mudanças de rotina e situações estressantes.

3. **Autoconhecimento**: Promover maior compreensão sobre seus próprios sentimentos, características e necessidades.

4. **Flexibilidade cognitiva**: Trabalhar a capacidade de adaptação a situações novas e mudanças.

Abordagem teórico-metodológica: Terapia Cognitivo-Comportamental adaptada para crianças, com recursos lúdicos e técnicas de mindfulness.`,
    avaliacaoAtendimento: '',
    evolucoes: mockEvolucoes,
    status: 'ativo',
    criadoEm: '2026-01-06T10:00:00Z',
    atualizadoEm: '2026-01-13T15:00:00Z',
};

// ============================================
// MOCK - LISTA DE PRONTUÁRIOS
// ============================================

export const mockProntuariosList: ProntuarioListItem[] = [
    {
        id: '1',
        clienteId: 'client-001',
        clienteNome: 'Lucas Gabriel Santos',
        clienteIdade: '9 anos',
        terapeutaNome: 'Dra. Carolina Mendes',
        terapeutaCrp: '06/123456',
        totalEvolucoes: 2,
        ultimaEvolucao: '2026-01-13',
        status: 'ativo',
        criadoEm: '2026-01-06',
    },
    {
        id: '2',
        clienteId: 'client-002',
        clienteNome: 'Maria Eduarda Oliveira',
        clienteIdade: '14 anos',
        terapeutaNome: 'Dra. Carolina Mendes',
        terapeutaCrp: '06/123456',
        totalEvolucoes: 8,
        ultimaEvolucao: '2026-01-10',
        status: 'ativo',
        criadoEm: '2025-11-15',
    },
    {
        id: '3',
        clienteId: 'client-003',
        clienteNome: 'Pedro Henrique Costa',
        clienteIdade: '7 anos',
        terapeutaNome: 'Dra. Carolina Mendes',
        terapeutaCrp: '06/123456',
        totalEvolucoes: 15,
        ultimaEvolucao: '2026-01-08',
        status: 'ativo',
        criadoEm: '2025-08-20',
    },
];

// ============================================
// FUNÇÕES AUXILIARES MOCK
// ============================================

export function getMockProntuarioById(id: string): ProntuarioPsicologico | null {
    if (id === '1') return mockProntuario;
    return null;
}

export function getMockProntuarioByClienteId(clienteId: string): ProntuarioPsicologico | null {
    if (clienteId === 'client-001') return mockProntuario;
    return null;
}
