import { BaseCadastroProgramaPage } from '../../../core/pages/BaseCadastroProgramaPage';
import { fonoProgramConfig, fonoRoutes } from '../config';
import {
    fetchFonoPatientById,
    fetchFonoTherapistById,
    fetchFonoTherapistAvatar,
    createFonoProgram,
} from '../services';

/**
 * Página de Cadastro de Programa para Fonoaudiologia
 * Wrapper que usa a página base com configurações específicas de Fono
 */
export function FonoCadastroProgramaPage() {
    return (
        <BaseCadastroProgramaPage
            config={fonoProgramConfig}
            onFetchPatient={fetchFonoPatientById}
            onFetchTherapist={fetchFonoTherapistById}
            onFetchTherapistAvatar={fetchFonoTherapistAvatar}
            onCreateProgram={createFonoProgram}
            detailRoute={fonoRoutes.detail}
            newSessionRoute={fonoRoutes.newSession}
            listRoute={fonoRoutes.list}
        />
    );
}
