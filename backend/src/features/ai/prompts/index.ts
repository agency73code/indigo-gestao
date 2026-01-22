/**
 * Centraliza exports de todos os prompts
 * @module features/ai/prompts
 */

// Relatórios
export {
    PROMPTS_RELATORIO,
    buildRelatorioUserPrompt,
    formatObservationsForPrompt,
    RELATORIO_DISCLAIMER,
} from './relatorio.prompts.js';

// Atas de Reunião
export {
    PROMPTS_ATA,
    buildAtaPrompt,
} from './ata.prompts.js';

// Prontuário Psicológico
export {
    PROMPTS_PRONTUARIO,
    buildProntuarioUserPrompt,
    formatEvolutionsForPrompt,
    PRONTUARIO_DISCLAIMER,
} from './prontuario.prompts.js';

// Compatibilidade com código legado
export { PROMPTS_RELATORIO as default } from './relatorio.prompts.js';
