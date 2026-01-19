/**
 * Configurações centralizadas do serviço de Psicoterapia
 * Segue padrão de atas.config.ts
 */

// ============================================
// CONFIGURAÇÃO DE AMBIENTE
// ============================================

const API_BASE = import.meta.env.VITE_API_URL || '';

// ✅ Mock CRUD ATIVADO para desenvolvimento
// Para desabilitar: VITE_USE_MOCK_PSICOTERAPIA=false
const USE_MOCK_CRUD = import.meta.env.VITE_USE_MOCK_PSICOTERAPIA !== 'false';

// Mock IA DESATIVADO por padrão (requer chamada ao backend)
// Para ativar mock IA: VITE_USE_MOCK_PSICOTERAPIA_IA=true
const USE_MOCK_IA = import.meta.env.VITE_USE_MOCK_PSICOTERAPIA_IA === 'true';

// ============================================
// EXPORTS
// ============================================

export const psicoterapiaServiceConfig = {
    apiBase: API_BASE,
    useMockCrud: USE_MOCK_CRUD,
    useMockIA: USE_MOCK_IA,
    /** @deprecated Use useMockCrud */
    get useMock() { return USE_MOCK_CRUD; },
    endpoints: {
        prontuarios: `${API_BASE}/prontuarios-psicologicos`,
        evolucoes: (prontuarioId: string) => `${API_BASE}/prontuarios-psicologicos/${prontuarioId}/evolucoes`,
        porCliente: (clienteId: string) => `${API_BASE}/prontuarios-psicologicos/cliente/${clienteId}`,
        anamneses: `${API_BASE}/anamneses`,
        anamneseDetalhe: (id: string) => `${API_BASE}/anamneses/${id}`,
    },
} as const;
