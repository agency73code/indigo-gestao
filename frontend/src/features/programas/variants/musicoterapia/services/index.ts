/**
 * Services de Musicoterapia
 * Exporta serviços mock durante desenvolvimento
 * Quando backend estiver pronto, trocar para api.ts
 */

// Durante desenvolvimento, usar mock para programas e sessões
export {
    fetchMusiProgramById,
    fetchMusiPrograms,
    createMusiProgram,
    updateMusiProgram,
    fetchMusiRecentSessions,
    fetchMusiProgramChart,
    saveMusiSession,
    fetchMusiSessions,
    fetchMusiSessionById,
} from './mockService';

// Funções que chamam API real (para buscar dados de clientes e terapeutas)
export {
    fetchMusiPatientById,
    fetchMusiClientAvatar,
    fetchMusiTherapistById,
    fetchMusiTherapistAvatar,
    listMusiPrograms,
} from './api';

// Re-export api functions with alias for when backend is ready
// export * from './api';

