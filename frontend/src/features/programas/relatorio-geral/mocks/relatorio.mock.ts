import type { 
  KpisRelatorio, 
  SerieLinha, 
  PrazoPrograma,
  Sessao 
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