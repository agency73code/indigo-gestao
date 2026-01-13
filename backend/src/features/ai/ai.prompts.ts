/**
 * Re-export de prompts para compatibilidade
 * 
 * NOVOS PROMPTS devem ser adicionados na pasta /prompts
 * Este arquivo mantém compatibilidade com imports existentes
 * 
 * @module features/ai
 * @deprecated Importe diretamente de './prompts'
 */

// Re-exports para compatibilidade
export {
    PROMPTS_RELATORIO,
    PROMPTS_ATA,
    buildRelatorioUserPrompt,
    buildAtaPrompt,
    formatObservationsForPrompt,
    RELATORIO_DISCLAIMER,
} from './prompts/index.js';

// Aliases para compatibilidade com código legado
import { PROMPTS_RELATORIO, buildRelatorioUserPrompt, formatObservationsForPrompt, RELATORIO_DISCLAIMER } from './prompts/index.js';

/** @deprecated Use PROMPTS_RELATORIO.SYSTEM */
export const CLINICAL_SUMMARY_SYSTEM_PROMPT = PROMPTS_RELATORIO.SYSTEM;

/** @deprecated Use buildRelatorioUserPrompt */
export const buildUserPrompt = buildRelatorioUserPrompt;

/** @deprecated Use RELATORIO_DISCLAIMER */
export const AI_DISCLAIMER = RELATORIO_DISCLAIMER;

// Re-export formatObservationsForPrompt já feito acima
