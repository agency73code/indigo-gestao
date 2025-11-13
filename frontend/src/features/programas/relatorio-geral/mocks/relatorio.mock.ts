import type { 
  KpisRelatorio, 
  SerieLinha, 
  PrazoPrograma,
  Sessao,
  AttentionStimulusItem
} from '../types';

export const mockKpis: KpisRelatorio = {
  acerto: 72,
  independencia: 65.2,
  tentativas: 450,
  sessoes: 15,
  assiduidade: 88.9,
  gapIndependencia: 13.3
};

export const mockSerieLinha: SerieLinha[] = [
  { x: '01/09', acerto: 52, independencia: 15 },
  { x: '03/09', acerto: 75, independencia: 61 },
  { x: '05/09', acerto: 78, independencia: 64 },
  { x: '08/09', acerto: 80, independencia: 52 },
  { x: '10/09', acerto: 79, independencia: 65 },
  { x: '12/09', acerto: 83, independencia: 70 },
  { x: '15/09', acerto: 95, independencia: 95 }
];

export const mockPrazoPrograma: PrazoPrograma = {
  percent: 68,
  label: '15 dias restantes • 68% do período decorrido',
  inicio: '2025-07-01',
  fim: '2025-10-01'
};

export const mockSessoes: Sessao[] = [
  {
    id: '1',
    pacienteId: 'pac-1',
    terapeutaId: 'ter-1',
    data: '2024-09-01T10:00:00Z',
    programaId: 'prog-1',
    programaNome: 'Desenvolvimento Cognitivo',
    objetivo: 'Melhorar capacidades de raciocínio',
    prazoInicio: '2024-08-01',
    prazoFim: '2024-10-31',
    registros: [
      { tentativa: 1, resultado: 'acerto', estimuloId: 'est-1' },
      { tentativa: 2, resultado: 'ajuda', estimuloId: 'est-2' },
      { tentativa: 3, resultado: 'erro', estimuloId: 'est-3' }
    ]
  }
];

export const mockAttentionStimuli: AttentionStimulusItem[] = [
  {
    id: 'est-12',
    label: 'Identificar cores primárias',
    counts: {
      erro: 15,
      ajuda: 8,
      indep: 12
    },
    total: 35,
    independence: 34.3,
    status: 'atencao'
  },
  {
    id: 'est-45',
    label: 'Contar de 1 a 10',
    counts: {
      erro: 10,
      ajuda: 12,
      indep: 18
    },
    total: 40,
    independence: 45.0,
    status: 'atencao'
  },
  {
    id: 'est-78',
    label: 'Reconhecer formas geométricas',
    counts: {
      erro: 8,
      ajuda: 10,
      indep: 22
    },
    total: 40,
    independence: 55.0,
    status: 'atencao'
  },
  {
    id: 'est-23',
    label: 'Nomear animais domésticos',
    counts: {
      erro: 5,
      ajuda: 7,
      indep: 18
    },
    total: 30,
    independence: 60.0,
    status: 'atencao'
  }
];

// Mocks específicos por janela de sessões
export const mockAttentionStimuliByWindow = {
  1: [ // Última 1 sessão - pior desempenho
    {
      id: 'est-12',
      label: 'Identificar cores primárias',
      counts: { erro: 5, ajuda: 3, indep: 2 },
      total: 10,
      independence: 20.0,
      status: 'atencao' as const
    },
    {
      id: 'est-45',
      label: 'Contar de 1 a 10',
      counts: { erro: 4, ajuda: 4, indep: 3 },
      total: 11,
      independence: 27.3,
      status: 'atencao' as const
    }
  ],
  3: [ // Últimas 3 sessões - desempenho médio
    {
      id: 'est-12',
      label: 'Identificar cores primárias',
      counts: { erro: 10, ajuda: 6, indep: 8 },
      total: 24,
      independence: 33.3,
      status: 'atencao' as const
    },
    {
      id: 'est-45',
      label: 'Contar de 1 a 10',
      counts: { erro: 7, ajuda: 8, indep: 12 },
      total: 27,
      independence: 44.4,
      status: 'atencao' as const
    },
    {
      id: 'est-78',
      label: 'Reconhecer formas geométricas',
      counts: { erro: 5, ajuda: 7, indep: 15 },
      total: 27,
      independence: 55.6,
      status: 'atencao' as const
    }
  ],
  5: [ // Últimas 5 sessões - dados completos
    {
      id: 'est-12',
      label: 'Identificar cores primárias',
      counts: { erro: 15, ajuda: 8, indep: 12 },
      total: 35,
      independence: 34.3,
      status: 'atencao' as const
    },
    {
      id: 'est-45',
      label: 'Contar de 1 a 10',
      counts: { erro: 10, ajuda: 12, indep: 18 },
      total: 40,
      independence: 45.0,
      status: 'atencao' as const
    },
    {
      id: 'est-78',
      label: 'Reconhecer formas geométricas',
      counts: { erro: 8, ajuda: 10, indep: 22 },
      total: 40,
      independence: 55.0,
      status: 'atencao' as const
    },
    {
      id: 'est-23',
      label: 'Nomear animais domésticos',
      counts: { erro: 5, ajuda: 7, indep: 18 },
      total: 30,
      independence: 60.0,
      status: 'atencao' as const
    }
  ]
};