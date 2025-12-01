import { BaseCadastroProgramaPage } from '../../../core/pages/BaseCadastroProgramaPage';
import { fisioProgramConfig, fisioRoutes } from '../config';
import {
    fetchFisioPatientById,
    fetchFisioTherapistById,
    fetchFisioTherapistAvatar,
    createFisioProgram,
} from '../services';

/**
 * Página de Cadastro de Programa para Fisioterapia
 * Wrapper que usa a página base com configurações específicas de TO
 */
export default function ToCadastroProgramaPage() {
    return (
        <BaseCadastroProgramaPage
            config={fisioProgramConfig}
            onFetchPatient={fetchFisioPatientById}
            onFetchTherapist={fetchFisioTherapistById}
            onFetchTherapistAvatar={fetchFisioTherapistAvatar}
            onCreateProgram={createFisioProgram}
            detailRoute={fisioRoutes.detail}
            newSessionRoute={fisioRoutes.newSession}
            listRoute={fisioRoutes.list}
        />
    );
}
