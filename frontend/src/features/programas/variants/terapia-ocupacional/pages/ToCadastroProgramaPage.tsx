import { BaseCadastroProgramaPage } from '../../../core/pages/BaseCadastroProgramaPage';
import { toProgramConfig, toRoutes } from '../config';
import {
    fetchToPatientById,
    fetchToTherapistById,
    fetchToTherapistAvatar,
    createToProgram,
} from '../services';

/**
 * Página de Cadastro de Programa para Terapia Ocupacional
 * Wrapper que usa a página base com configurações específicas de TO
 */
export default function ToCadastroProgramaPage() {
    return (
        <BaseCadastroProgramaPage
            config={toProgramConfig}
            onFetchPatient={fetchToPatientById}
            onFetchTherapist={fetchToTherapistById}
            onFetchTherapistAvatar={fetchToTherapistAvatar}
            onCreateProgram={createToProgram}
            detailRoute={toRoutes.detail}
            newSessionRoute={toRoutes.newSession}
            listRoute={toRoutes.list}
        />
    );
}
