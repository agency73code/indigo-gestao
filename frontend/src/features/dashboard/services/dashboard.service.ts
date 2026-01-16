// =============================================================================
// Dashboard Service - Mock Data para Visualização
// =============================================================================

import { getClientesAtivos } from '@/lib/api';
import { getAllLinks, getAllPatients } from '@/features/cadastros/links/services/links.service';
import type {
  DashboardTerapeutaData,
  DashboardGerenteData,
  TerapeutaMetrics,
  GerenteMetrics,
  SessoesPorArea,
  SessoesPorMes,
  MeuCliente,
  EquipePerformance,
  AtividadeRecente,
  EstimuloAtencao,
  TerapeutaRanking,
  PacienteAtencao,
  DashboardData,
  DashboardMetrics,
} from '../types';

// -----------------------------------------------------------------------------
// Configurações
// -----------------------------------------------------------------------------

const AREAS_CONFIG: Record<string, { label: string; color: string }> = {
  fonoaudiologia: { label: 'Fonoaudiologia', color: '#3b82f6' },
  'terapia-ocupacional': { label: 'Terapia Ocupacional', color: '#10b981' },
  fisioterapia: { label: 'Fisioterapia', color: '#f59e0b' },
  psicoterapia: { label: 'Psicoterapia', color: '#8b5cf6' },
  musicoterapia: { label: 'Musicoterapia', color: '#ec4899' },
  aba: { label: 'Terapia ABA', color: '#06b6d4' },
};

// -----------------------------------------------------------------------------
// Mock Data Generators - Shared
// -----------------------------------------------------------------------------

function getMockSessoesPorArea(): SessoesPorArea[] {
  const mockData = [
    { area: 'fonoaudiologia', total: 45 },
    { area: 'terapia-ocupacional', total: 38 },
    { area: 'fisioterapia', total: 32 },
    { area: 'psicoterapia', total: 28 },
    { area: 'aba', total: 25 },
    { area: 'musicoterapia', total: 18 },
  ];

  const totalGeral = mockData.reduce((sum, item) => sum + item.total, 0);

  return mockData.map((item) => ({
    area: item.area,
    label: AREAS_CONFIG[item.area]?.label ?? item.area,
    total: item.total,
    percentual: Math.round((item.total / totalGeral) * 100),
    color: AREAS_CONFIG[item.area]?.color ?? '#6b7280',
  }));
}

function getMockSessoesPorMes(): SessoesPorMes[] {
  return [
    { mes: 'Ago', total: 142 },
    { mes: 'Set', total: 168 },
    { mes: 'Out', total: 155 },
    { mes: 'Nov', total: 189 },
    { mes: 'Dez', total: 134 },
    { mes: 'Jan', total: 186 },
  ];
}

// -----------------------------------------------------------------------------
// Mock Data Generators - Terapeuta
// -----------------------------------------------------------------------------

function getMockTerapeutaMetrics(): TerapeutaMetrics {
  return {
    meusPacientes: 8,
    minhasSessoesEstaSemana: 12,
    minhasSessoesEsteMes: 47,
    meusProgramasAtivos: 15,
  };
}

function getMockAtividadesRecentes(): AtividadeRecente[] {
  return [
    {
      id: '1',
      tipo: 'sessao',
      descricao: 'Sessão de Fonoaudiologia registrada',
      paciente: 'Maria Silva',
      data: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: '2',
      tipo: 'programa',
      descricao: 'Novo programa OCP criado',
      paciente: 'Pedro Oliveira',
      data: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: '3',
      tipo: 'sessao',
      descricao: 'Sessão de Terapia Ocupacional registrada',
      paciente: 'Lucas Ferreira',
      data: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
    {
      id: '4',
      tipo: 'relatorio',
      descricao: 'Relatório mensal gerado',
      paciente: 'Ana Beatriz',
      data: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: '5',
      tipo: 'sessao',
      descricao: 'Sessão de Fisioterapia registrada',
      paciente: 'Gabriel Santos',
      data: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    },
  ];
}

function getMockEstimulosAtencao(): EstimuloAtencao[] {
  return [
    {
      id: '1',
      nome: 'Identificação de Cores',
      paciente: 'Maria Silva',
      taxaAcerto: 35,
      totalTentativas: 48,
      area: 'Fonoaudiologia',
    },
    {
      id: '2',
      nome: 'Coordenação Motora Fina',
      paciente: 'Pedro Oliveira',
      taxaAcerto: 42,
      totalTentativas: 36,
      area: 'Terapia Ocupacional',
    },
    {
      id: '3',
      nome: 'Reconhecimento de Números',
      paciente: 'Lucas Ferreira',
      taxaAcerto: 38,
      totalTentativas: 52,
      area: 'Terapia ABA',
    },
    {
      id: '4',
      nome: 'Equilíbrio Postural',
      paciente: 'Ana Beatriz',
      taxaAcerto: 45,
      totalTentativas: 28,
      area: 'Fisioterapia',
    },
  ];
}

// -----------------------------------------------------------------------------
// Mock Data Generators - Gerente
// -----------------------------------------------------------------------------

function getMockGerenteMetrics(clientesAtivos: number): GerenteMetrics {
  return {
    totalPacientes: clientesAtivos || 24,
    totalTerapeutas: 12,
    sessoesClinicaSemana: 47,
    sessoesClinicaMes: 186,
    taxaIndependenciaClinica: 72.5,
  };
}

function getMockEquipePerformance(): EquipePerformance[] {
  return [
    { mes: 'Ago', sessoes: 142, independencia: 65 },
    { mes: 'Set', sessoes: 168, independencia: 68 },
    { mes: 'Out', sessoes: 155, independencia: 70 },
    { mes: 'Nov', sessoes: 189, independencia: 71 },
    { mes: 'Dez', sessoes: 134, independencia: 69 },
    { mes: 'Jan', sessoes: 186, independencia: 72 },
  ];
}

function getMockTerapeutasRanking(): TerapeutaRanking[] {
  return [
    {
      id: '1',
      nome: 'Dr. João Santos',
      sessoesMes: 42,
      pacientesAtivos: 8,
      taxaIndependencia: 78.5,
    },
    {
      id: '2',
      nome: 'Dra. Ana Costa',
      sessoesMes: 38,
      pacientesAtivos: 7,
      taxaIndependencia: 75.2,
    },
    {
      id: '3',
      nome: 'Dr. Carlos Lima',
      sessoesMes: 35,
      pacientesAtivos: 6,
      taxaIndependencia: 72.8,
    },
    {
      id: '4',
      nome: 'Dra. Maria Souza',
      sessoesMes: 32,
      pacientesAtivos: 5,
      taxaIndependencia: 70.1,
    },
    {
      id: '5',
      nome: 'Dr. Ricardo Alves',
      sessoesMes: 28,
      pacientesAtivos: 4,
      taxaIndependencia: 68.9,
    },
  ];
}

function getMockPacientesAtencao(): PacienteAtencao[] {
  return [
    {
      id: '1',
      nome: 'Pedro Oliveira',
      motivo: 'sem_sessao',
      descricao: 'Sem sessão há 15 dias',
      ultimaAtualizacao: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    },
    {
      id: '2',
      nome: 'Ana Beatriz',
      motivo: 'baixa_performance',
      descricao: 'Taxa de independência abaixo de 40%',
      ultimaAtualizacao: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: '3',
      nome: 'Lucas Ferreira',
      motivo: 'prazo_programa',
      descricao: 'Programa vence em 5 dias',
      ultimaAtualizacao: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    },
    {
      id: '4',
      nome: 'Gabriel Santos',
      motivo: 'sem_sessao',
      descricao: 'Sem sessão há 10 dias',
      ultimaAtualizacao: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    },
  ];
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

/**
 * Busca os clientes vinculados ao terapeuta logado
 * Combina dados de vínculos (com área de atuação) com dados de clientes (com nome)
 */
async function fetchMeusClientes(): Promise<MeuCliente[]> {
  try {
    // Busca vínculos ativos e lista de clientes em paralelo
    const [links, patients] = await Promise.all([
      getAllLinks({ status: 'active', viewBy: 'patient' }),
      getAllPatients(),
    ]);

    // Cria um mapa de clientes para lookup rápido
    const patientsMap = new Map(patients.map(p => [p.id, p]));

    // Combina os dados
    const meusClientes: MeuCliente[] = [];
    
    for (const link of links) {
      const patient = patientsMap.get(link.patientId);
      if (patient) {
        meusClientes.push({
          id: link.patientId,
          nome: patient.nome,
          avatarUrl: patient.avatarUrl ?? undefined,
          areaAtuacao: link.actuationArea ?? 'Não definida',
          ultimaSessao: null, // TODO: buscar última sessão quando endpoint estiver disponível
        });
      }
    }

    return meusClientes;
  } catch (error) {
    console.error('Erro ao buscar meus clientes:', error);
    return [];
  }
}

export async function getDashboardTerapeutaData(): Promise<DashboardTerapeutaData> {
  const meusClientes = await fetchMeusClientes();

  return {
    metrics: {
      ...getMockTerapeutaMetrics(),
      meusPacientes: meusClientes.length, // Usa o total real de clientes
    },
    sessoesPorMes: getMockSessoesPorMes(),
    meusClientes,
    atividadesRecentes: getMockAtividadesRecentes(),
  };
}

export async function getDashboardGerenteData(): Promise<DashboardGerenteData> {
  const clientesAtivos = (await getClientesAtivos()) ?? 0;

  return {
    metrics: getMockGerenteMetrics(clientesAtivos),
    sessoesPorArea: getMockSessoesPorArea(),
    sessoesPorMes: getMockSessoesPorMes(),
    equipePerformance: getMockEquipePerformance(),
    terapeutasRanking: getMockTerapeutasRanking(),
    pacientesAtencao: getMockPacientesAtencao(),
  };
}

// -----------------------------------------------------------------------------
// Legacy (mantido para compatibilidade)
// -----------------------------------------------------------------------------

function getMockLegacyMetrics(clientesAtivos: number): DashboardMetrics {
  return {
    clientesAtivos: clientesAtivos || 24,
    sessoesEstaSemana: 47,
    sessoesEsteMes: 186,
    programasAtivos: 38,
    terapeutasAtivos: 12,
    taxaIndependencia: 72.5,
  };
}

/** @deprecated Use getDashboardTerapeutaData ou getDashboardGerenteData */
export async function getDashboardData(): Promise<DashboardData> {
  const clientesAtivos = (await getClientesAtivos()) ?? 0;

  return {
    metrics: getMockLegacyMetrics(clientesAtivos),
    sessoesPorArea: getMockSessoesPorArea(),
    sessoesPorMes: getMockSessoesPorMes(),
    evolucaoPerformance: [],
    atividadesRecentes: getMockAtividadesRecentes().map((a) => ({ ...a, terapeuta: 'Dr. João Santos' })),
    estimulosAtencao: getMockEstimulosAtencao(),
  };
}
