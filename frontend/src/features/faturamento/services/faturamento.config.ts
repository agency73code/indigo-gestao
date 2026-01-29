// ============================================
// CONFIGURAÇÃO DE AMBIENTE - FATURAMENTO
// ============================================

const API_BASE = import.meta.env.VITE_API_URL;

// Por padrão, usar mocks até o backend estar pronto
// Para desabilitar mocks, defina VITE_USE_MOCK_FATURAMENTO=false no .env
const USE_MOCK = false;

// ============================================
// EXPORTS
// ============================================

export const faturamentoConfig = {
    apiBase: API_BASE,
    useMock: USE_MOCK,
} as const;
