/**
 * Exportação das páginas de Psicoterapia
 */

export { default as PsicoterapiaHubPage } from './PsicoterapiaHubPage';
export { default as CadastrarProntuarioPage } from './CadastrarProntuarioPage';
export { default as ConsultarProntuariosPage } from './ConsultarProntuariosPage';
export { default as DetalheProntuarioPage } from './DetalheProntuarioPage';

// Re-exportar PsicoterapiaPage como default para compatibilidade com rotas existentes
export { default } from './PsicoterapiaHubPage';
