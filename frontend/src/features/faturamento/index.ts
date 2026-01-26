/**
 * ============================================================================
 * FEATURE - FATURAMENTO
 * ============================================================================
 * 
 * Exports públicos da feature de faturamento.
 * 
 * Esta feature permite:
 * - Terapeuta: Lançar horas trabalhadas e acompanhar status
 * - Gerente: Visualizar, aprovar e gerenciar lançamentos
 * ============================================================================
 */

// Types
export * from './types';

// Pages
export {
    HubFaturamentoPage,
    HubFaturamentoPage as FaturamentoHubPage, // Alias para compatibilidade com routes.tsx
    MinhasHorasPage,
    GestaoHorasPage,
    RegistrarLancamentoPage,
    DetalheLancamentoPage,
} from './pages';

// Components
export {
    LancamentosTable,
    LancamentoDrawer,
} from './components';

// Hooks
export {
    useLancamentos,
    useLancamentoForm,
    useResumoHoras,
} from './hooks';

// Services
export {
    listLancamentos,
    getLancamento,
    createLancamento,
    updateLancamento,
    deleteLancamento,
    aprovarLancamento,
    rejeitarLancamento,
    aprovarEmLote,
    listClientes,
    listTerapeutas,
    getTerapeutaLogado,
    getResumoTerapeuta,
    getResumoGestao,
} from './services/faturamento.service';
