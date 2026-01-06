import AutoExpandTextarea from '../../ui/AutoExpandTextarea';
import type { AnamneseFinalizacao } from '../../types/anamnese.types';

interface FinalizacaoStepProps {
    data: Partial<AnamneseFinalizacao>;
    onChange: (data: Partial<AnamneseFinalizacao>) => void;
    fieldErrors?: Record<string, string>;
}

export default function FinalizacaoStep({ data, onChange, fieldErrors = {} }: FinalizacaoStepProps) {
    return (
        <div className="space-y-4">
            {/* 21. Outras Informações Relevantes */}
            <div className="rounded-2xl border bg-white p-4 space-y-4">
                <h3 className="text-sm font-medium">21. Outras informações que o informante julgue serem relevantes <span className="text-red-500">*</span></h3>
                
                <div className="space-y-1">
                    <AutoExpandTextarea
                        label=""
                        placeholder="Sua resposta"
                        value={data.outrasInformacoesRelevantes ?? ''}
                        onChange={(value) => onChange({ ...data, outrasInformacoesRelevantes: value })}
                    />
                    {fieldErrors['outrasInformacoesRelevantes'] && (
                        <p className="text-xs text-red-500">{fieldErrors['outrasInformacoesRelevantes']}</p>
                    )}
                </div>
            </div>

            {/* 22. Observações do Terapeuta */}
            <div className="rounded-2xl border bg-white p-4 space-y-4">
                <h3 className="text-sm font-medium">22. Observações e/ou impressões do terapeuta <span className="text-red-500">*</span></h3>
                
                <div className="space-y-1">
                    <AutoExpandTextarea
                        label=""
                        placeholder="Sua resposta"
                        value={data.observacoesImpressoesTerapeuta ?? ''}
                        onChange={(value) => onChange({ ...data, observacoesImpressoesTerapeuta: value })}
                    />
                    {fieldErrors['observacoesImpressoesTerapeuta'] && (
                        <p className="text-xs text-red-500">{fieldErrors['observacoesImpressoesTerapeuta']}</p>
                    )}
                </div>
            </div>

            {/* 23. Expectativas da Família */}
            <div className="rounded-2xl border bg-white p-4 space-y-4">
                <h3 className="text-sm font-medium">23. Expectativas da família com o tratamento <span className="text-red-500">*</span></h3>
                
                <div className="space-y-1">
                    <AutoExpandTextarea
                        label=""
                        placeholder="Ex: Quais são as expectativas da família com o tratamento? O que esperam alcançar? Quais são as prioridades?"
                        value={data.expectativasFamilia ?? ''}
                        onChange={(value) => onChange({ ...data, expectativasFamilia: value })}
                    />
                    {fieldErrors['expectativasFamilia'] && (
                        <p className="text-xs text-red-500">{fieldErrors['expectativasFamilia']}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
