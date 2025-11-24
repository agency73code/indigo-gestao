import { BaseConsultaProgramasPage } from '../../../core/pages/BaseConsultaProgramasPage';
import { fonoRoutes } from '../config';

export function FonoConsultaProgramasPage() {
    return (
        <BaseConsultaProgramasPage
            config={{
                pageTitle: 'Consultar Programas & Objetivos',
                createButtonLabel: 'Adicionar programa',
                noPatientMessage: 'Por favor, selecione um cliente antes de criar um programa.',
            }}
            createProgramRoute={(patientId, patientName) =>
                `${fonoRoutes.create}?patientId=${patientId}&patientName=${encodeURIComponent(patientName)}`
            }
        />
    );
}
