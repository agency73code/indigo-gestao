// ============================================
// CONFIGURAÇÃO DE AMBIENTE
// ============================================

const API_BASE = import.meta.env.VITE_API_URL || '';
const USE_MOCK_CRUD = import.meta.env.VITE_USE_MOCK_ATAS !== 'false';
const USE_MOCK_IA = import.meta.env.VITE_USE_MOCK_ATAS_IA === 'true';

// ============================================
// EXPORTS
// ============================================

export const atasConfig = {
    apiBase: API_BASE,
    useMockCrud: USE_MOCK_CRUD,
    useMockIA: USE_MOCK_IA,
} as const;

