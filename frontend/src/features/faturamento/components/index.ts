/**
 * Componentes da feature Faturamento
 */

// Novo componente baseado em sessões e atas
export { FaturamentoHub } from './FaturamentoHub';
export { FaturamentoGerenteHub } from './FaturamentoGerenteHub';
export { FaturamentoTable, type FaturamentoColumnFilters, type FaturamentoColumnFilterOptions } from './FaturamentoTable';

// Componentes antigos (deprecados - serão removidos)
export { LancamentosTable, default as LancamentosTableDefault } from './LancamentosTable';
export type { SortState, LancamentoColumnFilters, LancamentoColumnFilterOptions } from './LancamentosTable';
export { LancamentoDrawer } from './LancamentoDrawer';
