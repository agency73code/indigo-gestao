import type { AnamneseDetalhe } from '../../types/anamnese-consulta.types';
import ReadOnlyField from '../ReadOnlyField';

interface FinalizacaoSectionProps {
    data: AnamneseDetalhe;
}

export function FinalizacaoSection({ data }: FinalizacaoSectionProps) {
    const fin = data.finalizacao;

    return (
        <div className="space-y-4">
            <ReadOnlyField label="21. Outras informações que o informante julgue serem relevantes" value={fin.outrasInformacoesRelevantes} />
            <ReadOnlyField label="22. Observações e/ou impressões do terapeuta" value={fin.observacoesImpressoesTerapeuta} />
            <ReadOnlyField label="23. Expectativas da família com o tratamento" value={fin.expectativasFamilia} />
        </div>
    );
}
