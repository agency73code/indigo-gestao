/**
 * Feature de Anamnese - Tabela de Listagem
 * Exporta componentes e páginas para listagem de anamneses cadastradas
 */

// Pages
export { default as AnamneseListPage } from './pages/AnamneseListPage';

// Components
export { default as AnamneseTable } from './components/AnamneseTable';

// Services
export * from './services/anamnese-table.service';

// Types - apenas os que não conflitam
export type { AnamneseListItem, PaginationState, SortState } from './types/anamnese-table.types';

// Mocks (para desenvolvimento)
export * from './mocks/anamnese.mock';
