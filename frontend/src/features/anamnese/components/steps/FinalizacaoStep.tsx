import AutoExpandTextarea from '../ui/AutoExpandTextarea';
import type { AnamneseFinalizacao } from '../../types/anamnese.types';

interface FinalizacaoStepProps {
    data: Partial<AnamneseFinalizacao>;
    onChange: (data: Partial<AnamneseFinalizacao>) => void;
}

export default function FinalizacaoStep({ data, onChange }: FinalizacaoStepProps) {
    return (
        <div className="space-y-4">
            {/* 21. Outras Informações Relevantes */}
            <div className="rounded-2xl border bg-white p-4 space-y-4">
                <h3 className="text-sm font-medium">21. Outras informações que o informante julgue serem relevantes</h3>
                
                <AutoExpandTextarea
                    label=""
                    placeholder="Sua resposta"
                    value={data.outrasInformacoesRelevantes ?? ''}
                    onChange={(value) => onChange({ ...data, outrasInformacoesRelevantes: value })}
                />
            </div>

            {/* 22. Observações do Terapeuta */}
            <div className="rounded-2xl border bg-white p-4 space-y-4">
                <h3 className="text-sm font-medium">22. Observações e/ou impressões do terapeuta</h3>
                
                <AutoExpandTextarea
                    label=""
                    placeholder="Sua resposta"
                    value={data.observacoesImpressoesTerapeuta ?? ''}
                    onChange={(value) => onChange({ ...data, observacoesImpressoesTerapeuta: value })}
                />
            </div>
        </div>
    );
}
