// ============================================
// CONFIGURAÇÃO DE AMBIENTE - FATURAMENTO
// ============================================

const API_BASE = import.meta.env.VITE_API_URL || '';

// ✅ Mock ATIVADO para desenvolvimento
// Para desabilitar: mude para false
const USE_MOCK = false;

// ============================================
// EXPORTS
// ============================================

export const faturamentoConfig = {
    apiBase: API_BASE,
    useMock: USE_MOCK,
} as const;
