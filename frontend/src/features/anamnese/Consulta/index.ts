/**
 * Feature de Anamnese - Consulta
 * Exporta componentes e páginas para visualização detalhada de anamneses
 */

// Components
export { default as AnamneseProfileDrawer } from './components/AnamneseProfileDrawer';
export { default as ReadOnlyField } from './components/ReadOnlyField';

// Services
export * from './services/anamnese-consulta.service';

// Types
export * from './types/anamnese-consulta.types';

// Nota: Mocks não são exportados aqui para evitar inclusão em produção
// Para desenvolvimento, importe diretamente de './mocks/anamnese-consulta.mock'
