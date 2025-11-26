# Sistema de Relatórios Multi-Área

## Visão Geral

Sistema adaptativo de relatórios que permite visualizações e métricas diferentes para cada área terapêutica (Fonoaudiologia, Terapia Ocupacional, Fisioterapia, etc.) sem duplicação de páginas.

## Arquitetura

### Componentes Principais

```
relatorios/
├── pages/
│   └── GerarRelatorioPage.tsx       # Página principal adaptativa
├── configs/                          # 🆕 Configurações por área
│   ├── index.ts                     # Exporta AREA_CONFIGS
│   ├── types.ts                     # Tipos TypeScript
│   ├── fonoConfig.ts                # Config Fonoaudiologia
│   ├── toConfig.ts                  # Config Terapia Ocupacional
│   └── movimentoConfig.ts           # Config Fisio/Psico/Ed.Física
├── components/                       # 🆕 Componentes adaptativos
│   ├── AreaSelector.tsx             # Seletor de área
│   ├── KpiCardsRenderer.tsx         # Renderiza KPIs dinamicamente
│   └── ChartRenderer.tsx            # Factory de gráficos
└── variants/                         # 🔜 Componentes específicos por área
    ├── fono/
    ├── to/
    └── movimento/
```

### Fluxo de Funcionamento

1. **Seleção de Cliente**: Usuário seleciona o paciente
2. **Seleção de Área**: Usuário escolhe a área terapêutica (Fono, TO, Movimento, etc.)
3. **Carregamento de Config**: Sistema carrega configuração específica da área
4. **Adaptação de Dados**: Dados da API são adaptados via `dataAdapter`
5. **Renderização Dinâmica**: Componentes renderizam baseado na config

## Configuração de Área

Cada área possui um arquivo de configuração que define:

### Estrutura da Config

```typescript
interface RelatorioAreaConfig {
  id: string;              // 'fonoaudiologia' | 'terapia-ocupacional' | etc
  label: string;           // Nome de exibição
  icon: LucideIcon;        // Ícone da área
  
  kpis: KpiConfig[];       // Cards KPI a serem exibidos
  charts: ChartConfig[];   // Gráficos específicos
  filters: FilterConfig;   // Filtros disponíveis
  
  apiEndpoint: string;     // Endpoint da API
  attentionComponent?: ComponentType;  // Componente de atenção
  deadlineComponent?: ComponentType;   // Componente de prazo
  dataAdapter?: (rawData: any) => any; // Função de adaptação
}
```

### Exemplo: Fonoaudiologia

```typescript
export const fonoConfig: RelatorioAreaConfig = {
  id: 'fonoaudiologia',
  label: 'Fonoaudiologia',
  icon: Activity,
  
  kpis: [
    {
      type: 'acerto-geral',
      label: 'Acerto geral',
      icon: Target,
      dataKey: 'acerto',
    },
    // ... mais KPIs
  ],
  
  charts: [
    {
      type: 'dual-line-progress',
      title: 'Evolução - Acerto vs Independência',
      component: DualLineProgress,
      dataKey: 'serieLinha',
    },
  ],
  
  apiEndpoint: '/api/ocp/reports',
  attentionComponent: AttentionStimuliCard,
  deadlineComponent: OcpDeadlineCard,
};
```

### Exemplo: Terapia Ocupacional

```typescript
export const toConfig: RelatorioAreaConfig = {
  id: 'terapia-ocupacional',
  label: 'Terapia Ocupacional',
  
  kpis: [
    { type: 'desempenhou', label: 'Desempenhou', ... },
    { type: 'desempenhou-ajuda', label: 'Com Ajuda', ... },
    { type: 'nao-desempenhou', label: 'Não Desempenhou', ... },
  ],
  
  charts: [
    {
      type: 'performance-bars',
      title: 'Desempenho por Atividade',
      component: ToPerformanceBars, // A ser criado
      dataKey: 'performanceByActivity',
    },
  ],
  
  apiEndpoint: '/api/to/reports', // Endpoint específico
};
```

## Adicionando Nova Área

### 1. Criar arquivo de configuração

```typescript
// configs/psicopedagogiaConfig.ts
import { Brain } from 'lucide-react';
import type { RelatorioAreaConfig } from './types';

export const psicopedagogiaConfig: RelatorioAreaConfig = {
  id: 'psicopedagogia',
  label: 'Psicopedagogia',
  icon: Brain,
  
  kpis: [
    // Definir KPIs específicos
  ],
  
  charts: [
    // Definir gráficos específicos
  ],
  
  filters: {
    programa: true,
    estimulo: true,
    terapeuta: true,
    periodo: true,
  },
  
  apiEndpoint: '/api/psicopedagogia/reports',
  
  dataAdapter: (rawData) => ({
    // Adaptar dados da API
  }),
};
```

### 2. Registrar no index.ts

```typescript
// configs/index.ts
import { psicopedagogiaConfig } from './psicopedagogiaConfig';

export const AREA_CONFIGS: AreaConfigMap = {
  'fonoaudiologia': fonoConfig,
  'terapia-ocupacional': toConfig,
  'psicopedagogia': psicopedagogiaConfig, // 🆕
  // ...
};
```

### 3. Criar componentes específicos (se necessário)

```typescript
// variants/psicopedagogia/PsicopedagogiaCharts.tsx
export function PsicopedagogiaCharts({ data, loading }: ChartProps) {
  // Implementar visualização específica
}
```

### 4. Atualizar config com componente

```typescript
charts: [
  {
    type: 'psicopedagogia-progress',
    title: 'Progresso Cognitivo',
    component: PsicopedagogiaCharts,
    dataKey: 'progressData',
  },
],
```

## Tipos de KPIs Disponíveis

### Padrão (Fono)
- `acerto-geral`: Percentual de acerto geral
- `independencia`: Percentual de independência
- `tentativas`: Total de tentativas
- `sessoes`: Total de sessões

### Terapia Ocupacional
- `desempenhou`: Atividades desempenhadas com sucesso
- `desempenhou-ajuda`: Atividades com ajuda
- `nao-desempenhou`: Atividades não desempenhadas

### Movimento (Fisio/Psico/Ed.Física)
- `amplitude-movimento`: Amplitude de movimento
- `coordenacao`: Coordenação motora
- `tentativas`: Tentativas realizadas
- `sessoes`: Sessões do período

## Tipos de Gráficos Disponíveis

### Implementados
- `dual-line-progress`: Linha dupla (Acerto + Independência) - Fono

### A Implementar
- `performance-bars`: Barras de desempenho - TO
- `evolution-area`: Área de evolução motora - Movimento
- `comparative-radar`: Radar comparativo - Psico

## Backend / API

### Endpoints Esperados

```typescript
// Fonoaudiologia (atual)
GET /api/ocp/reports/kpis?clientId=...&periodo=...
GET /api/ocp/reports/graphic?clientId=...&periodo=...
GET /api/ocp/reports/deadline?clientId=...

// Terapia Ocupacional (a implementar)
GET /api/to/reports/kpis?clientId=...&periodo=...
GET /api/to/reports/performance?clientId=...&periodo=...

// Movimento (a implementar)
GET /api/movimento/reports/kpis?clientId=...&periodo=...
GET /api/movimento/reports/evolution?clientId=...&periodo=...
```

### Formato de Resposta

```typescript
// KPIs
{
  kpis: {
    acerto: 85.5,
    independencia: 78.3,
    // ... outros valores
  }
}

// Gráficos
{
  graphic: [
    { x: '2025-01-01', acerto: 80, independencia: 75 },
    // ...
  ]
}
```

## Componentes Reutilizáveis

### AreaSelector

Seletor de área terapêutica que só exibe áreas com config de relatório.

```tsx
<AreaSelector
  value={selectedArea}
  onChange={handleAreaChange}
  disabled={!selectedPatient}
/>
```

### KpiCardsRenderer

Renderiza cards KPI dinamicamente baseado na config.

```tsx
<KpiCardsRenderer 
  configs={areaConfig.kpis}
  data={adaptedData.kpis}
  loading={loadingKpis}
/>
```

### ChartRenderer

Factory de gráficos que instancia o componente correto.

```tsx
<ChartRenderer
  config={chartConfig}
  data={adaptedData.graphicData}
  loading={loadingCharts}
/>
```

## Estado e Sincronização

### URL Params

A área selecionada é persistida na URL:

```
/app/relatorios/novo?pacienteId=123&area=terapia-ocupacional&periodo=30d
```

### Contexto Global

O `AreaContext` é atualizado quando o usuário muda a área no relatório:

```typescript
const { currentArea, setCurrentArea } = useArea();

const handleAreaChange = (area: AreaType | null) => {
  setSelectedArea(area);
  setCurrentArea(area); // Atualiza contexto global
};
```

## Filtros Condicionais

Cada área pode definir quais filtros estão disponíveis:

```typescript
filters: {
  programa: true,      // Mostrar filtro de programa
  estimulo: true,      // Mostrar filtro de estímulo
  terapeuta: true,     // Mostrar filtro de terapeuta
  periodo: true,       // Mostrar filtro de período
  comparar: false,     // Ocultar opção de comparação
}
```

## Performance

### Lazy Loading

Componentes de gráfico são carregados sob demanda:

```typescript
const ToCharts = lazy(() => import('./variants/to/ToCharts'));
```

### Memoização

Configurações são memoizadas para evitar recálculos:

```typescript
const areaConfig = useMemo(() => getAreaConfig(selectedArea), [selectedArea]);
```

## Próximos Passos

### Curto Prazo
1. ✅ Criar estrutura de configuração por área
2. ✅ Implementar componentes adaptativos (AreaSelector, KpiCardsRenderer, ChartRenderer)
3. ✅ Adaptar GerarRelatorioPage para usar sistema de configs
4. 🔜 Criar componentes de gráfico para TO (PerformanceBars)
5. 🔜 Implementar backend endpoints para TO

### Médio Prazo
6. Criar configuração e componentes para Movimento (Fisio/Psico/Ed.Física)
7. Implementar componente EvolutionArea para Movimento
8. Adicionar filtros customizados por área

### Longo Prazo
9. Criar configurações para Psicopedagogia, Musicoterapia, etc.
10. Sistema de templates de relatório por área
11. Exportação PDF com layouts específicos por área

## Troubleshooting

### Área não aparece no seletor
- Verificar se está registrada em `AREA_CONFIGS`
- Verificar se `hasReportConfig()` retorna true

### Dados não carregam
- Verificar `apiEndpoint` na config
- Verificar se backend retorna dados no formato esperado
- Verificar `dataAdapter` se definido

### Gráfico não renderiza
- Verificar se `component` está definido no `ChartConfig`
- Verificar se dados estão na chave correta (`dataKey`)
- Verificar import e lazy loading do componente

## Referências

- **Configurações**: `/features/relatorios/configs/`
- **Componentes**: `/features/relatorios/components/`
- **Página Principal**: `/features/relatorios/pages/GerarRelatorioPage.tsx`
- **Contexto de Área**: `/contexts/AreaContext.tsx`
