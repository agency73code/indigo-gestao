import type { 
  KpisRelatorio, 
  SerieLinha, 
  LinhaBarras, 
  HeatmapData, 
  SparkItem, 
  PrazoPrograma,
  Sessao 
} from '../types';

export const mockKpis: KpisRelatorio = {
  acerto: 78.5,
  independencia: 65.2,
  tentativas: 450,
  sessoes: 15,
  assiduidade: 88.9,
  gapIndependencia: 13.3
};

export const mockSerieLinha: SerieLinha[] = [
  { x: '01/09', acerto: 72, independencia: 58 },
  { x: '03/09', acerto: 75, independencia: 61 },
  { x: '05/09', acerto: 78, independencia: 64 },
  { x: '08/09', acerto: 81, independencia: 67 },
  { x: '10/09', acerto: 79, independencia: 65 },
  { x: '12/09', acerto: 83, independencia: 70 },
  { x: '15/09', acerto: 85, independencia: 72 }
];

export const mockBarras: LinhaBarras[] = [
  { sessao: 'Sessão 1', acerto: 60, ajuda: 25, erro: 15 },
  { sessao: 'Sessão 2', acerto: 65, ajuda: 20, erro: 15 },
  { sessao: 'Sessão 3', acerto: 70, ajuda: 18, erro: 12 },
  { sessao: 'Sessão 4', acerto: 75, ajuda: 15, erro: 10 },
  { sessao: 'Sessão 5', acerto: 78, ajuda: 12, erro: 10 }
];

export const mockHeatmap: HeatmapData = {
  sessoes: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'],
  linhas: [
    { 
      estimulo: 'Contar até 10', 
      valores: ['acerto', 'acerto', 'ajuda', 'acerto', 'acerto', 'acerto', 'acerto'] 
    },
    { 
      estimulo: 'Identificar cores', 
      valores: ['ajuda', 'acerto', 'acerto', 'acerto', 'acerto', 'ajuda', 'acerto'] 
    },
    { 
      estimulo: 'Formar palavras', 
      valores: ['erro', 'ajuda', 'ajuda', 'acerto', 'acerto', 'acerto', 'acerto'] 
    },
    { 
      estimulo: 'Matemática básica', 
      valores: ['erro', 'erro', 'ajuda', 'ajuda', 'acerto', 'acerto', 'acerto'] 
    }
  ]
};

export const mockSparklines: SparkItem[] = [
  {
    estimulo: 'Contar até 10',
    serie: [
      { x: 1, y: 60 }, { x: 2, y: 65 }, { x: 3, y: 72 }, { x: 4, y: 78 }, { x: 5, y: 85 }
    ],
    status: 'manutencao'
  },
  {
    estimulo: 'Identificar cores',
    serie: [
      { x: 1, y: 45 }, { x: 2, y: 52 }, { x: 3, y: 58 }, { x: 4, y: 65 }, { x: 5, y: 70 }
    ],
    status: 'aprendizagem'
  },
  {
    estimulo: 'Formar palavras',
    serie: [
      { x: 1, y: 30 }, { x: 2, y: 35 }, { x: 3, y: 42 }, { x: 4, y: 48 }, { x: 5, y: 55 }
    ],
    status: 'dominar'
  }
];

export const mockPrazoPrograma: PrazoPrograma = {
  percent: 68,
  label: '15 dias restantes • 68% do período decorrido'
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