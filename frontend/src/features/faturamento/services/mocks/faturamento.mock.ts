/**
 * ============================================================================
 * MOCK DATA - FATURAMENTO
 * ============================================================================
 * 
 * Dados mock para desenvolvimento e testes.
 * Este arquivo pode ser removido após implementação do backend.
 * 
 * IMPORTANTE: Mocks são isolados para fácil remoção futura.
 * ============================================================================
 */

import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import type {
    Lancamento,
    LancamentoListFilters,
    LancamentoListResponse,
    CreateLancamentoInput,
    UpdateLancamentoInput,
    ClienteOption,
    TerapeutaOption,
    ResumoHorasTerapeuta,
    ResumoGestao,
    ValoresTerapeuta,
} from '../../types';
import {
    TIPO_ATIVIDADE,
    STATUS_LANCAMENTO,
    type TipoAtividade,
    type StatusLancamento,
} from '../../types';

// ============================================
// DADOS MOCK - TERAPEUTAS
// ============================================

const mockValoresTerapeuta: ValoresTerapeuta = {
    sessaoConsultorio: 150,
    sessaoHomecare: 180,
    desenvolvimentoMateriais: 80,
    supervisaoRecebida: 100,
    supervisaoDada: 120,
    reuniao: 90,
};

export const mockTerapeutas: TerapeutaOption[] = [
    {
        id: 'ter-001',
        nome: 'Dra. Ana Paula Silva',
        avatarUrl: undefined,
        valoresPorAtividade: mockValoresTerapeuta,
    },
    {
        id: 'ter-002',
        nome: 'Dr. Carlos Eduardo Santos',
        avatarUrl: undefined,
        valoresPorAtividade: {
            ...mockValoresTerapeuta,
            sessaoConsultorio: 160,
            sessaoHomecare: 200,
        },
    },
    {
        id: 'ter-003',
        nome: 'Dra. Marina Costa',
        avatarUrl: undefined,
        valoresPorAtividade: mockValoresTerapeuta,
    },
];

// ============================================
// DADOS MOCK - CLIENTES
// ============================================

export const mockClientes: ClienteOption[] = [
    { id: 'cli-001', nome: 'Miguel Oliveira', avatarUrl: undefined },
    { id: 'cli-002', nome: 'Sofia Pereira', avatarUrl: undefined },
    { id: 'cli-003', nome: 'Arthur Santos', avatarUrl: undefined },
    { id: 'cli-004', nome: 'Helena Costa', avatarUrl: undefined },
    { id: 'cli-005', nome: 'Theo Rodrigues', avatarUrl: undefined },
    { id: 'cli-006', nome: 'Laura Fernandes', avatarUrl: undefined },
    { id: 'cli-007', nome: 'Pedro Almeida', avatarUrl: undefined },
    { id: 'cli-008', nome: 'Valentina Souza', avatarUrl: undefined },
];

// ============================================
// DADOS MOCK - LANÇAMENTOS
// ============================================

function calcularDuracao(horarioInicio: string, horarioFim: string): number {
    const [hI, mI] = horarioInicio.split(':').map(Number);
    const [hF, mF] = horarioFim.split(':').map(Number);
    return (hF * 60 + mF) - (hI * 60 + mI);
}

function calcularValorTotal(duracaoMinutos: number, valorHora: number): number {
    return (duracaoMinutos / 60) * valorHora;
}

function getValorPorTipo(tipo: TipoAtividade, valores: ValoresTerapeuta): number {
    const map: Record<TipoAtividade, keyof ValoresTerapeuta> = {
        [TIPO_ATIVIDADE.SESSAO_CONSULTORIO]: 'sessaoConsultorio',
        [TIPO_ATIVIDADE.SESSAO_HOMECARE]: 'sessaoHomecare',
        [TIPO_ATIVIDADE.DESENVOLVIMENTO_MATERIAIS]: 'desenvolvimentoMateriais',
        [TIPO_ATIVIDADE.SUPERVISAO_RECEBIDA]: 'supervisaoRecebida',
        [TIPO_ATIVIDADE.SUPERVISAO_DADA]: 'supervisaoDada',
        [TIPO_ATIVIDADE.REUNIAO]: 'reuniao',
    };
    return valores[map[tipo]];
}

// Gerador de lançamentos mock
function gerarLancamentosMock(): Lancamento[] {
    const lancamentos: Lancamento[] = [];
    const terapeuta = mockTerapeutas[0]; // Terapeuta logado (simulação)
    const valores = terapeuta.valoresPorAtividade!;
    
    // Gerar lançamentos dos últimos 60 dias
    for (let i = 0; i < 25; i++) {
        const diasAtras = Math.floor(Math.random() * 60);
        const data = format(subDays(new Date(), diasAtras), 'yyyy-MM-dd');
        const cliente = mockClientes[Math.floor(Math.random() * mockClientes.length)];
        
        const tiposAtividade = Object.values(TIPO_ATIVIDADE);
        const tipoAtividade = tiposAtividade[Math.floor(Math.random() * tiposAtividade.length)];
        
        const horaInicio = 8 + Math.floor(Math.random() * 10); // 8h às 18h
        const duracao = [30, 45, 60, 90, 120][Math.floor(Math.random() * 5)];
        const horarioInicio = `${String(horaInicio).padStart(2, '0')}:00`;
        const horaFim = horaInicio + Math.floor(duracao / 60);
        const minFim = duracao % 60;
        const horarioFim = `${String(horaFim).padStart(2, '0')}:${String(minFim).padStart(2, '0')}`;
        
        const isHomecare = tipoAtividade === TIPO_ATIVIDADE.SESSAO_HOMECARE || Math.random() > 0.7;
        const valorHora = getValorPorTipo(tipoAtividade, valores);
        const duracaoMinutos = calcularDuracao(horarioInicio, horarioFim);
        const valorTotal = calcularValorTotal(duracaoMinutos, valorHora);
        
        const statusOptions: StatusLancamento[] = [
            STATUS_LANCAMENTO.PENDENTE,
            STATUS_LANCAMENTO.APROVADO,
            STATUS_LANCAMENTO.APROVADO,
            STATUS_LANCAMENTO.APROVADO,
            STATUS_LANCAMENTO.REJEITADO,
        ];
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        
        lancamentos.push({
            id: `lanc-${String(i + 1).padStart(3, '0')}`,
            terapeutaId: terapeuta.id,
            terapeutaNome: terapeuta.nome,
            terapeutaAvatarUrl: terapeuta.avatarUrl,
            clienteId: cliente.id,
            clienteNome: cliente.nome,
            clienteAvatarUrl: cliente.avatarUrl,
            data,
            horarioInicio,
            horarioFim,
            tipoAtividade,
            isHomecare,
            duracaoMinutos,
            valorHora,
            valorTotal,
            observacoes: Math.random() > 0.7 ? 'Observação de exemplo para o lançamento.' : undefined,
            anexos: [],
            status,
            motivoRejeicao: status === STATUS_LANCAMENTO.REJEITADO ? 'Dados incompletos' : undefined,
            criadoEm: format(subDays(new Date(), diasAtras), "yyyy-MM-dd'T'HH:mm:ss"),
            atualizadoEm: format(subDays(new Date(), diasAtras), "yyyy-MM-dd'T'HH:mm:ss"),
            aprovadoEm: status === STATUS_LANCAMENTO.APROVADO 
                ? format(subDays(new Date(), diasAtras - 1), "yyyy-MM-dd'T'HH:mm:ss") 
                : undefined,
        });
    }
    
    // Ordenar por data (mais recente primeiro)
    return lancamentos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

// Armazenamento em memória para simular persistência
let mockLancamentos = gerarLancamentosMock();

// ============================================
// FUNÇÕES MOCK - CRUD
// ============================================

/** Simula delay de rede */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Lista lançamentos com filtros e paginação */
export async function mockListLancamentos(
    filters: LancamentoListFilters = {}
): Promise<LancamentoListResponse> {
    await delay(300);
    
    let items = [...mockLancamentos];
    
    // Filtro por terapeuta
    if (filters.terapeutaId) {
        items = items.filter(l => l.terapeutaId === filters.terapeutaId);
    }
    
    // Filtro por cliente
    if (filters.clienteId) {
        items = items.filter(l => l.clienteId === filters.clienteId);
    }
    
    // Filtro por tipo de atividade
    if (filters.tipoAtividade && filters.tipoAtividade !== 'all') {
        items = items.filter(l => l.tipoAtividade === filters.tipoAtividade);
    }
    
    // Filtro por status
    if (filters.status && filters.status !== 'all') {
        items = items.filter(l => l.status === filters.status);
    }
    
    // Filtro por período
    if (filters.dataInicio) {
        items = items.filter(l => l.data >= filters.dataInicio!);
    }
    if (filters.dataFim) {
        items = items.filter(l => l.data <= filters.dataFim!);
    }
    
    // Busca textual
    if (filters.q) {
        const query = filters.q.toLowerCase();
        items = items.filter(l => 
            l.clienteNome.toLowerCase().includes(query) ||
            l.observacoes?.toLowerCase().includes(query)
        );
    }
    
    // Ordenação
    if (filters.orderBy === 'oldest') {
        items.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    } else {
        items.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    }
    
    // Paginação
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const total = items.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);
    
    return {
        items: paginatedItems,
        total,
        page,
        pageSize,
        totalPages,
    };
}

/** Busca lançamento por ID */
export async function mockGetLancamento(id: string): Promise<Lancamento | null> {
    await delay(200);
    return mockLancamentos.find(l => l.id === id) || null;
}

/** Cria novo lançamento */
export async function mockCreateLancamento(
    input: CreateLancamentoInput,
    terapeutaId: string
): Promise<Lancamento> {
    await delay(400);
    
    const terapeuta = mockTerapeutas.find(t => t.id === terapeutaId) || mockTerapeutas[0];
    const cliente = mockClientes.find(c => c.id === input.clienteId);
    const valores = terapeuta.valoresPorAtividade!;
    
    const duracaoMinutos = calcularDuracao(input.horarioInicio, input.horarioFim);
    const valorHora = getValorPorTipo(input.tipoAtividade, valores);
    const valorTotal = calcularValorTotal(duracaoMinutos, valorHora);
    
    const now = new Date().toISOString();
    const newId = `lanc-${String(mockLancamentos.length + 1).padStart(3, '0')}`;
    
    const lancamento: Lancamento = {
        id: newId,
        terapeutaId: terapeuta.id,
        terapeutaNome: terapeuta.nome,
        terapeutaAvatarUrl: terapeuta.avatarUrl,
        clienteId: input.clienteId,
        clienteNome: cliente?.nome || 'Cliente não encontrado',
        clienteAvatarUrl: cliente?.avatarUrl,
        data: input.data,
        horarioInicio: input.horarioInicio,
        horarioFim: input.horarioFim,
        tipoAtividade: input.tipoAtividade,
        isHomecare: input.isHomecare,
        duracaoMinutos,
        valorHora,
        valorTotal,
        observacoes: input.observacoes,
        anexos: [],
        status: STATUS_LANCAMENTO.PENDENTE,
        criadoEm: now,
        atualizadoEm: now,
    };
    
    mockLancamentos = [lancamento, ...mockLancamentos];
    return lancamento;
}

/** Atualiza lançamento existente */
export async function mockUpdateLancamento(
    id: string,
    input: UpdateLancamentoInput
): Promise<Lancamento | null> {
    await delay(300);
    
    const index = mockLancamentos.findIndex(l => l.id === id);
    if (index === -1) return null;
    
    const existing = mockLancamentos[index];
    const terapeuta = mockTerapeutas.find(t => t.id === existing.terapeutaId);
    const valores = terapeuta?.valoresPorAtividade || mockValoresTerapeuta;
    
    // Recalcular valores se horários mudaram
    let duracaoMinutos = existing.duracaoMinutos;
    let valorHora = existing.valorHora;
    let valorTotal = existing.valorTotal;
    
    if (input.horarioInicio || input.horarioFim || input.tipoAtividade) {
        const inicio = input.horarioInicio || existing.horarioInicio;
        const fim = input.horarioFim || existing.horarioFim;
        const tipo = input.tipoAtividade || existing.tipoAtividade;
        
        duracaoMinutos = calcularDuracao(inicio, fim);
        valorHora = getValorPorTipo(tipo, valores);
        valorTotal = calcularValorTotal(duracaoMinutos, valorHora);
    }
    
    // Converter anexos de AnexoUpload para AnexoLancamento se houver
    const anexosConvertidos = input.anexos?.map(anexo => ({
        id: anexo.id,
        nome: anexo.nome,
        tamanho: anexo.file.size,
        tipo: anexo.file.type,
        url: undefined,
        arquivoId: undefined,
    }));
    
    const updated: Lancamento = {
        ...existing,
        ...input,
        anexos: anexosConvertidos || existing.anexos,
        duracaoMinutos,
        valorHora,
        valorTotal,
        atualizadoEm: new Date().toISOString(),
        aprovadoEm: input.status === STATUS_LANCAMENTO.APROVADO ? new Date().toISOString() : existing.aprovadoEm,
    };
    
    mockLancamentos[index] = updated;
    return updated;
}

/** Deleta lançamento */
export async function mockDeleteLancamento(id: string): Promise<boolean> {
    await delay(300);
    
    const index = mockLancamentos.findIndex(l => l.id === id);
    if (index === -1) return false;
    
    mockLancamentos.splice(index, 1);
    return true;
}

// ============================================
// FUNÇÕES MOCK - AUXILIARES
// ============================================

/** Lista clientes disponíveis */
export async function mockListClientes(): Promise<ClienteOption[]> {
    await delay(200);
    return mockClientes;
}

/** Lista terapeutas disponíveis */
export async function mockListTerapeutas(): Promise<TerapeutaOption[]> {
    await delay(200);
    return mockTerapeutas;
}

/** Busca terapeuta logado (simulação) */
export async function mockGetTerapeutaLogado(): Promise<TerapeutaOption> {
    await delay(100);
    return mockTerapeutas[0];
}

// ============================================
// FUNÇÕES MOCK - RESUMOS
// ============================================

/** Resumo de horas do terapeuta */
export async function mockGetResumoTerapeuta(
    terapeutaId: string,
    periodoInicio?: string,
    periodoFim?: string
): Promise<ResumoHorasTerapeuta> {
    await delay(300);
    
    const inicio = periodoInicio || format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const fim = periodoFim || format(endOfMonth(new Date()), 'yyyy-MM-dd');
    
    const lancamentosTerapeuta = mockLancamentos.filter(l => 
        l.terapeutaId === terapeutaId &&
        l.data >= inicio &&
        l.data <= fim
    );
    
    const totalMinutos = lancamentosTerapeuta.reduce((acc, l) => acc + l.duracaoMinutos, 0);
    const totalValor = lancamentosTerapeuta.reduce((acc, l) => acc + l.valorTotal, 0);
    
    // Agrupar por tipo de atividade
    const porTipoMap = new Map<TipoAtividade, { horas: number; minutos: number; sessoes: number; valor: number }>();
    for (const l of lancamentosTerapeuta) {
        const existing = porTipoMap.get(l.tipoAtividade) || { horas: 0, minutos: 0, sessoes: 0, valor: 0 };
        existing.minutos += l.duracaoMinutos;
        existing.horas = Math.floor(existing.minutos / 60);
        existing.sessoes += 1;
        existing.valor += l.valorTotal;
        porTipoMap.set(l.tipoAtividade, existing);
    }
    
    return {
        totalHoras: Math.floor(totalMinutos / 60),
        totalMinutos: totalMinutos % 60,
        totalSessoes: lancamentosTerapeuta.length,
        totalValor,
        porTipoAtividade: Array.from(porTipoMap.entries()).map(([tipo, data]) => ({
            tipo,
            ...data,
        })),
        porStatus: {
            pendentes: lancamentosTerapeuta.filter(l => l.status === STATUS_LANCAMENTO.PENDENTE).length,
            aprovados: lancamentosTerapeuta.filter(l => l.status === STATUS_LANCAMENTO.APROVADO).length,
            rejeitados: lancamentosTerapeuta.filter(l => l.status === STATUS_LANCAMENTO.REJEITADO).length,
        },
        periodoInicio: inicio,
        periodoFim: fim,
    };
}

/** Resumo para gestão (gerente) */
export async function mockGetResumoGestao(
    periodoInicio?: string,
    periodoFim?: string
): Promise<ResumoGestao> {
    await delay(400);
    
    const inicio = periodoInicio || format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const fim = periodoFim || format(endOfMonth(new Date()), 'yyyy-MM-dd');
    
    const lancamentosPeriodo = mockLancamentos.filter(l => 
        l.data >= inicio &&
        l.data <= fim
    );
    
    const totalMinutos = lancamentosPeriodo.reduce((acc, l) => acc + l.duracaoMinutos, 0);
    const totalValor = lancamentosPeriodo.reduce((acc, l) => acc + l.valorTotal, 0);
    
    // Agrupar por terapeuta
    const porTerapeutaMap = new Map<string, { nome: string; horas: number; valor: number; count: number }>();
    for (const l of lancamentosPeriodo) {
        const existing = porTerapeutaMap.get(l.terapeutaId) || { nome: l.terapeutaNome, horas: 0, valor: 0, count: 0 };
        existing.horas += l.duracaoMinutos / 60;
        existing.valor += l.valorTotal;
        existing.count += 1;
        porTerapeutaMap.set(l.terapeutaId, existing);
    }
    
    // Agrupar por cliente
    const porClienteMap = new Map<string, { nome: string; horas: number; valor: number; count: number }>();
    for (const l of lancamentosPeriodo) {
        const existing = porClienteMap.get(l.clienteId) || { nome: l.clienteNome, horas: 0, valor: 0, count: 0 };
        existing.horas += l.duracaoMinutos / 60;
        existing.valor += l.valorTotal;
        existing.count += 1;
        porClienteMap.set(l.clienteId, existing);
    }
    
    return {
        totalLancamentos: lancamentosPeriodo.length,
        totalHoras: totalMinutos / 60,
        totalValor,
        pendentesAprovacao: lancamentosPeriodo.filter(l => l.status === STATUS_LANCAMENTO.PENDENTE).length,
        aprovadosNoMes: lancamentosPeriodo.filter(l => l.status === STATUS_LANCAMENTO.APROVADO).length,
        porTerapeuta: Array.from(porTerapeutaMap.entries()).map(([id, data]) => ({
            terapeutaId: id,
            terapeutaNome: data.nome,
            totalHoras: data.horas,
            totalValor: data.valor,
            lancamentos: data.count,
        })),
        porCliente: Array.from(porClienteMap.entries()).map(([id, data]) => ({
            clienteId: id,
            clienteNome: data.nome,
            totalHoras: data.horas,
            totalValor: data.valor,
            sessoes: data.count,
        })),
    };
}

// ============================================
// UTILITÁRIO PARA RESET (TESTES)
// ============================================

export function resetMockData(): void {
    mockLancamentos = gerarLancamentosMock();
}
