import { BaseCadastroProgramaPage } from '../../../core/pages/BaseCadastroProgramaPage';
import { musiProgramConfig, musiRoutes } from '../config';
import {
    fetchMusiPatientById,
    fetchMusiTherapistById,
    fetchMusiTherapistAvatar,
    createMusiProgram,
} from '../services';

/**
 * Página de Cadastro de Programa para Musicoterapia
 * Wrapper que usa a página base com configurações específicas de Musicoterapia
 */
export default function MusiCadastroProgramaPage() {
    return (
        <BaseCadastroProgramaPage
            config={musiProgramConfig}
            onFetchPatient={fetchMusiPatientById}
            onFetchTherapist={fetchMusiTherapistById}
            onFetchTherapistAvatar={fetchMusiTherapistAvatar}
            onCreateProgram={createMusiProgram}
            detailRoute={musiRoutes.detail}
            newSessionRoute={musiRoutes.newSession}
            listRoute={musiRoutes.list}
        />
    );
}
