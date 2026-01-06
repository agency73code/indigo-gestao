import { format, subDays } from 'date-fns';
import type {
    AtaReuniao,
    AtaListFilters,
    AtaListResponse,
    CreateAtaInput,
    UpdateAtaInput,
    TerapeutaOption,
    ClienteOption,
    CabecalhoAta,
    Participante,
} from '../../types';
import {
    FINALIDADE_REUNIAO,
    MODALIDADE_REUNIAO,
    TIPO_PARTICIPANTE,
} from '../../types';

// ============================================
// MOCK DATA - TERAPEUTAS
// ============================================

export const mockTerapeutas: TerapeutaOption[] = [
    {
        id: 'ter-001',
        nome: 'Dra. Ana Paula Silva',
        especialidade: 'Fonoaudiologia',
        cargo: 'Terapeuta Sênior',
        conselho: 'CRFa',
        registroConselho: '12345-SP',
    },
    {
        id: 'ter-002',
        nome: 'Dr. Carlos Eduardo Santos',
        especialidade: 'Terapia Ocupacional',
        cargo: 'Coordenador',
        conselho: 'CREFITO',
        registroConselho: '98765-3/TO',
    },
    {
        id: 'ter-003',
        nome: 'Dra. Marina Costa',
        especialidade: 'Psicologia',
        cargo: 'Terapeuta',
        conselho: 'CRP',
        registroConselho: '06/54321',
    },
    {
        id: 'ter-004',
        nome: 'Dr. Roberto Ferreira',
        especialidade: 'Fisioterapia',
        cargo: 'Terapeuta',
        conselho: 'CREFITO',
        registroConselho: '45678-3/F',
    },
    {
        id: 'ter-005',
        nome: 'Dra. Juliana Mendes',
        especialidade: 'Musicoterapia',
        cargo: 'Terapeuta',
        conselho: 'MT',
        registroConselho: 'MT-1234',
    },
];

// ============================================
// MOCK DATA - CLIENTES
// ============================================

export const mockClientes: ClienteOption[] = [
    { id: 'cli-001', nome: 'Miguel Oliveira' },
    { id: 'cli-002', nome: 'Sofia Pereira' },
    { id: 'cli-003', nome: 'Arthur Santos' },
    { id: 'cli-004', nome: 'Helena Costa' },
    { id: 'cli-005', nome: 'Theo Rodrigues' },
];

// ============================================
// MOCK DATA - ATAS
// ============================================

let mockAtas: AtaReuniao[] = [
    {
        id: 'ata-001',
        cabecalho: {
            terapeutaId: 'ter-001',
            terapeutaNome: 'Dra. Ana Paula Silva',
            conselhoNumero: '12345-SP',
            conselhoTipo: 'CRFa',
            profissao: 'Fonoaudióloga',
            cargo: 'Terapeuta Sênior',
        },
        data: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
        horario: '14:00',
        finalidade: FINALIDADE_REUNIAO.ORIENTACAO_PARENTAL,
        modalidade: MODALIDADE_REUNIAO.PRESENCIAL,
        participantes: [
            {
                id: 'part-001',
                tipo: TIPO_PARTICIPANTE.FAMILIA,
                nome: 'Maria Oliveira',
                descricao: 'Mãe',
            },
            {
                id: 'part-002',
                tipo: TIPO_PARTICIPANTE.FAMILIA,
                nome: 'José Oliveira',
                descricao: 'Pai',
            },
        ],
        conteudo: '<h2>Orientação Parental - Miguel</h2><p>Foram discutidos os seguintes pontos:</p><ul><li>Evolução nas atividades de linguagem oral</li><li>Estratégias para prática em casa</li><li>Próximos objetivos terapêuticos</li></ul><p><strong>Condutas:</strong> Os pais foram orientados a realizar exercícios de nomeação durante as refeições.</p>',
        clienteId: 'cli-001',
        clienteNome: 'Miguel Oliveira',
        status: 'finalizada',
        criadoEm: subDays(new Date(), 2).toISOString(),
        atualizadoEm: subDays(new Date(), 2).toISOString(),
    },
    {
        id: 'ata-002',
        cabecalho: {
            terapeutaId: 'ter-002',
            terapeutaNome: 'Dr. Carlos Eduardo Santos',
            conselhoNumero: '98765-3/TO',
            conselhoTipo: 'CREFITO',
            profissao: 'Terapeuta Ocupacional',
            cargo: 'Coordenador',
        },
        data: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
        horario: '10:30',
        finalidade: FINALIDADE_REUNIAO.REUNIAO_EQUIPE,
        modalidade: MODALIDADE_REUNIAO.ONLINE,
        participantes: [
            {
                id: 'part-003',
                tipo: TIPO_PARTICIPANTE.PROFISSIONAL_CLINICA,
                nome: 'Dra. Ana Paula Silva',
                terapeutaId: 'ter-001',
                especialidade: 'Fonoaudiologia',
                cargo: 'Terapeuta Sênior',
            },
            {
                id: 'part-004',
                tipo: TIPO_PARTICIPANTE.PROFISSIONAL_CLINICA,
                nome: 'Dra. Marina Costa',
                terapeutaId: 'ter-003',
                especialidade: 'Psicologia',
                cargo: 'Terapeuta',
            },
        ],
        conteudo: '<h2>Reunião de Equipe Multidisciplinar</h2><p>Discussão sobre o caso da paciente Sofia:</p><ul><li>Revisão dos objetivos atuais</li><li>Integração entre as áreas de TO e Fono</li><li>Definição de metas para o próximo trimestre</li></ul><p><strong>Encaminhamentos:</strong> Agendar reunião com a família para alinhamento.</p>',
        clienteId: 'cli-002',
        clienteNome: 'Sofia Pereira',
        status: 'finalizada',
        criadoEm: subDays(new Date(), 5).toISOString(),
        atualizadoEm: subDays(new Date(), 5).toISOString(),
    },
    {
        id: 'ata-003',
        cabecalho: {
            terapeutaId: 'ter-003',
            terapeutaNome: 'Dra. Marina Costa',
            conselhoNumero: '06/54321',
            conselhoTipo: 'CRP',
            profissao: 'Psicóloga',
            cargo: 'Terapeuta',
        },
        data: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
        horario: '15:00',
        finalidade: FINALIDADE_REUNIAO.REUNIAO_ESCOLA,
        modalidade: MODALIDADE_REUNIAO.PRESENCIAL,
        participantes: [
            {
                id: 'part-005',
                tipo: TIPO_PARTICIPANTE.PROFISSIONAL_EXTERNO,
                nome: 'Profa. Lucia Ferreira',
                descricao: 'Coordenadora Pedagógica',
            },
            {
                id: 'part-006',
                tipo: TIPO_PARTICIPANTE.PROFISSIONAL_EXTERNO,
                nome: 'Profa. Sandra Lima',
                descricao: 'Professora Regente',
            },
            {
                id: 'part-007',
                tipo: TIPO_PARTICIPANTE.FAMILIA,
                nome: 'Carla Santos',
                descricao: 'Mãe',
            },
        ],
        conteudo: '<h2>Reunião com a Escola - Arthur</h2><p>Pauta da reunião:</p><ol><li>Apresentação do quadro clínico</li><li>Estratégias de adaptação em sala de aula</li><li>Comunicação entre escola e clínica</li></ol><p><strong>Acordos:</strong></p><ul><li>Relatórios mensais de acompanhamento</li><li>Uso de apoio visual em sala</li><li>Tempo estendido para avaliações</li></ul>',
        clienteId: 'cli-003',
        clienteNome: 'Arthur Santos',
        status: 'finalizada',
        criadoEm: subDays(new Date(), 7).toISOString(),
        atualizadoEm: subDays(new Date(), 7).toISOString(),
    },
    {
        id: 'ata-004',
        cabecalho: {
            terapeutaId: 'ter-001',
            terapeutaNome: 'Dra. Ana Paula Silva',
            conselhoNumero: '12345-SP',
            conselhoTipo: 'CRFa',
            profissao: 'Fonoaudióloga',
            cargo: 'Terapeuta Sênior',
        },
        data: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
        horario: '09:00',
        finalidade: FINALIDADE_REUNIAO.SUPERVISAO_TERAPEUTA,
        modalidade: MODALIDADE_REUNIAO.ONLINE,
        participantes: [
            {
                id: 'part-008',
                tipo: TIPO_PARTICIPANTE.PROFISSIONAL_CLINICA,
                nome: 'Dra. Juliana Mendes',
                terapeutaId: 'ter-005',
                especialidade: 'Musicoterapia',
                cargo: 'Terapeuta',
            },
        ],
        conteudo: '<h2>Supervisão Clínica</h2><p>Discussão de caso e orientações técnicas para a terapeuta Juliana sobre integração de música na terapia de linguagem.</p><p><strong>Pontos abordados:</strong></p><ul><li>Uso de canções para estimulação de fala</li><li>Ritmo e prosódia</li><li>Materiais recomendados</li></ul>',
        status: 'rascunho',
        criadoEm: subDays(new Date(), 1).toISOString(),
        atualizadoEm: subDays(new Date(), 1).toISOString(),
    },
    {
        id: 'ata-005',
        cabecalho: {
            terapeutaId: 'ter-004',
            terapeutaNome: 'Dr. Roberto Ferreira',
            conselhoNumero: '45678-3/F',
            conselhoTipo: 'CREFITO',
            profissao: 'Fisioterapeuta',
            cargo: 'Terapeuta',
        },
        data: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
        horario: '11:00',
        finalidade: FINALIDADE_REUNIAO.OUTROS,
        finalidadeOutros: 'Reunião com plano de saúde para liberação de sessões',
        modalidade: MODALIDADE_REUNIAO.ONLINE,
        participantes: [
            {
                id: 'part-009',
                tipo: TIPO_PARTICIPANTE.PROFISSIONAL_EXTERNO,
                nome: 'Dr. Marcos Almeida',
                descricao: 'Auditor Médico - Unimed',
            },
        ],
        conteudo: '<h2>Reunião com Plano de Saúde</h2><p>Solicitação de ampliação do número de sessões autorizadas para a paciente Helena.</p><p><strong>Documentação apresentada:</strong></p><ul><li>Relatório de evolução</li><li>Justificativa clínica</li><li>Plano terapêutico atualizado</li></ul><p><strong>Resultado:</strong> Aprovadas mais 20 sessões.</p>',
        clienteId: 'cli-004',
        clienteNome: 'Helena Costa',
        status: 'finalizada',
        criadoEm: subDays(new Date(), 10).toISOString(),
        atualizadoEm: subDays(new Date(), 10).toISOString(),
    },
];

let nextAtaId = 6;

// ============================================
// HELPER - SIMULAR LATÊNCIA
// ============================================

const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================
// MOCK CRUD FUNCTIONS
// ============================================

export async function listAtasMock(filters?: AtaListFilters): Promise<AtaListResponse> {
    await delay(400);

    let filtered = [...mockAtas];

    // Filtro por texto (busca em nome do cliente, conteúdo, participantes)
    if (filters?.q) {
        const q = filters.q.toLowerCase();
        filtered = filtered.filter(
            (ata) =>
                ata.clienteNome?.toLowerCase().includes(q) ||
                ata.conteudo.toLowerCase().includes(q) ||
                ata.participantes.some((p: Participante) => p.nome.toLowerCase().includes(q))
        );
    }

    // Filtro por finalidade
    if (filters?.finalidade && filters.finalidade !== 'all') {
        filtered = filtered.filter((ata) => ata.finalidade === filters.finalidade);
    }

    // Filtro por data início
    if (filters?.dataInicio) {
        filtered = filtered.filter((ata) => ata.data >= filters.dataInicio!);
    }

    // Filtro por data fim
    if (filters?.dataFim) {
        filtered = filtered.filter((ata) => ata.data <= filters.dataFim!);
    }

    // Filtro por cliente
    if (filters?.clienteId) {
        filtered = filtered.filter((ata) => ata.clienteId === filters.clienteId);
    }

    // Ordenar por data
    const orderBy = filters?.orderBy ?? 'recent';
    if (orderBy === 'recent') {
        filtered.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    } else {
        filtered.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    }

    // Paginação
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return {
        items,
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
    };
}

export async function getAtaByIdMock(id: string): Promise<AtaReuniao | null> {
    await delay(200);
    return mockAtas.find((ata) => ata.id === id) ?? null;
}

export async function createAtaMock(input: CreateAtaInput): Promise<AtaReuniao> {
    await delay(400);

    const now = new Date().toISOString();
    const newAta: AtaReuniao = {
        id: `ata-${String(nextAtaId++).padStart(3, '0')}`,
        ...input.formData,
        cabecalho: input.cabecalho,
        status: 'rascunho',
        criadoEm: now,
        atualizadoEm: now,
    };

    mockAtas.unshift(newAta);
    return newAta;
}

export async function updateAtaMock(id: string, input: UpdateAtaInput): Promise<AtaReuniao | null> {
    await delay(300);

    const index = mockAtas.findIndex((ata) => ata.id === id);
    if (index === -1) return null;

    const updated: AtaReuniao = {
        ...mockAtas[index],
        ...input.formData,
        atualizadoEm: new Date().toISOString(),
    };

    mockAtas[index] = updated;
    return updated;
}

export async function deleteAtaMock(id: string): Promise<boolean> {
    await delay(300);

    const index = mockAtas.findIndex((ata) => ata.id === id);
    if (index === -1) return false;

    mockAtas.splice(index, 1);
    return true;
}

export async function finalizarAtaMock(id: string): Promise<AtaReuniao | null> {
    await delay(300);

    const index = mockAtas.findIndex((ata) => ata.id === id);
    if (index === -1) return null;

    mockAtas[index] = {
        ...mockAtas[index],
        status: 'finalizada',
        atualizadoEm: new Date().toISOString(),
    };

    return mockAtas[index];
}

export async function generateSummaryMock(id: string): Promise<string> {
    await delay(1500); // Simula tempo de processamento da IA

    const ata = mockAtas.find((a) => a.id === id);
    if (!ata) throw new Error('Ata não encontrada');

    // Simula um resumo gerado por IA
    const resumo = `**Resumo da Reunião**

📅 **Data:** ${ata.data} às ${ata.horario}
👥 **Participantes:** ${ata.participantes.map((p: Participante) => p.nome).join(', ')}
🎯 **Finalidade:** ${ata.finalidade === 'outros' ? ata.finalidadeOutros : ata.finalidade}

**Principais Pontos Discutidos:**
- Foram abordados tópicos relevantes ao acompanhamento terapêutico
- Definidas estratégias e orientações específicas
- Estabelecidos próximos passos e encaminhamentos

**Condutas e Encaminhamentos:**
- Acompanhamento contínuo das metas estabelecidas
- Comunicação regular entre os envolvidos
- Reavaliação em próxima reunião agendada

*Este resumo foi gerado automaticamente por IA.*`;

    // Atualiza a ata com o resumo
    const index = mockAtas.findIndex((a) => a.id === id);
    if (index !== -1) {
        mockAtas[index] = {
            ...mockAtas[index],
            resumoIA: resumo,
            atualizadoEm: new Date().toISOString(),
        };
    }

    return resumo;
}

// ============================================
// MOCK - BUSCAR TERAPEUTAS
// ============================================

export async function listTerapeutasMock(): Promise<TerapeutaOption[]> {
    await delay(200);
    return mockTerapeutas;
}

// ============================================
// MOCK - BUSCAR CLIENTES
// ============================================

export async function listClientesMock(): Promise<ClienteOption[]> {
    await delay(200);
    return mockClientes;
}

// ============================================
// MOCK - BUSCAR DADOS DO TERAPEUTA LOGADO
// ============================================

export async function getTerapeutaLogadoMock(userId: string): Promise<CabecalhoAta> {
    await delay(150);
    
    // Simula buscar dados completos do terapeuta logado
    const terapeuta = mockTerapeutas.find((t) => t.id === userId);
    
    if (terapeuta) {
        return {
            terapeutaId: terapeuta.id,
            terapeutaNome: terapeuta.nome,
            conselhoNumero: terapeuta.registroConselho,
            conselhoTipo: terapeuta.conselho,
            profissao: terapeuta.especialidade,
            cargo: terapeuta.cargo,
        };
    }

    // Fallback para terapeuta padrão (para desenvolvimento)
    return {
        terapeutaId: 'ter-001',
        terapeutaNome: 'Dra. Ana Paula Silva',
        conselhoNumero: '12345-SP',
        conselhoTipo: 'CRFa',
        profissao: 'Fonoaudióloga',
        cargo: 'Terapeuta Sênior',
    };
}
