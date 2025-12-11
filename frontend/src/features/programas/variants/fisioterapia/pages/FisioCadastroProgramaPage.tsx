import { BaseCadastroProgramaPage } from '../../../core/pages/BaseCadastroProgramaPage';
import { fisioProgramConfig, fisioBaseRoutes } from '../config';
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
            detailRoute={fisioBaseRoutes.detail}
            newSessionRoute={fisioBaseRoutes.newSession}
            listRoute={fisioBaseRoutes.list}
        />
    );
}
