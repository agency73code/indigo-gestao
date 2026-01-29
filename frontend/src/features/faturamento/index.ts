/**
 * ============================================================================
 * FEATURE - FATURAMENTO
 * ============================================================================
 * 
 * Exports públicos da feature de faturamento.
 * 
 * Esta feature permite:
 * - Terapeuta: Visualizar faturamento de sessões e atas cadastradas
 * - Gerente: Visualizar, aprovar e gerenciar faturamento
 * 
 * NOTA: Os dados de faturamento vêm de sessões e atas cadastradas.
 * Não há mais lançamentos manuais.
 * ============================================================================
 */

// Types - Novos
export * from './types/faturamento.types';

// Pages
export {
    HubFaturamentoPage,
    HubFaturamentoPage as FaturamentoHubPage, // Alias para compatibilidade com routes.tsx
    MinhasHorasSessoesPage,
    MinhasHorasSessoesPage as MinhasHorasPage,
    GestaoHorasPage,
    // Páginas do GERENTE (3 telas separadas)
    GestaoFaturamentoPage,
    AprovarHorasPage,
    HorasPorTerapeutaPage,
    HorasPorClientePage,
} from './pages';

// Components
export {
    FaturamentoHub,
    CorrectBillingDrawer,
    BillingDrawer,
} from './components';

// Hooks
export {
    useLancamentos,
    useLancamentoForm,
    useResumoHoras,
    useBillingCorrection,
} from './hooks';

// Services - Novos
export {
    listFaturamento,
    getFaturamentoById,
    getResumoFaturamento,
    listClientes,
    getTerapeutaLogado,
    aprovarLancamento,
    rejeitarLancamento,
    aprovarEmLote,
} from './services/faturamento-sessoes.service';
