/**
 * Componente de Informações Educacionais
 */

import { SelectField } from '@/ui/select-field';
import { AutoExpandTextarea } from '@/components/ui/auto-expand-textarea';
import type { ProntuarioFormData } from '../types';

interface InformacoesEducacionaisProps {
    data: ProntuarioFormData;
    onChange: (data: ProntuarioFormData) => void;
    fieldErrors?: Record<string, string>;
}

const NIVEIS_ESCOLARIDADE = [
    'Educação Infantil',
    'Ensino Fundamental - Anos Iniciais',
    'Ensino Fundamental - Anos Finais',
    'Ensino Médio',
    'Ensino Superior - Cursando',
    'Ensino Superior - Completo',
    'Pós-Graduação',
    'Não frequenta escola',
    'Outro',
];

export default function InformacoesEducacionais({ 
    data, 
    onChange, 
    fieldErrors = {} 
}: InformacoesEducacionaisProps) {
    return (
        <div className="space-y-3">
            {/* Nível de Escolaridade */}
            <SelectField
                label="Nível de Escolaridade"
                id="nivelEscolaridade"
                value={data.nivelEscolaridade || ''}
                onChange={(e) => onChange({ ...data, nivelEscolaridade: e.target.value })}
                error={fieldErrors.nivelEscolaridade}
            >
                <option value="">Selecione</option>
                {NIVEIS_ESCOLARIDADE.map((nivel) => (
                    <option key={nivel} value={nivel}>{nivel}</option>
                ))}
            </SelectField>

            {/* Instituição de Formação */}
            <div className="rounded-2xl border bg-white p-4">
                <AutoExpandTextarea
                    label="Instituição de Formação"
                    placeholder="Nome da escola/instituição"
                    value={data.instituicaoFormacao || ''}
                    onChange={(value) => onChange({ ...data, instituicaoFormacao: value })}
                />
            </div>

            {/* Profissão/Ocupação */}
            <div className="rounded-2xl border bg-white p-4">
                <AutoExpandTextarea
                    label="Profissão/Ocupação"
                    description="Utilizar caso o adolescente trabalhe como auxiliar de familiares ou como jovem aprendiz"
                    placeholder="Sua resposta"
                    value={data.profissaoOcupacao || ''}
                    onChange={(value) => onChange({ ...data, profissaoOcupacao: value })}
                />
            </div>

            {/* Observações */}
            <div className="rounded-2xl border bg-white p-4">
                <AutoExpandTextarea
                    label="Observações"
                    description="Histórico escolar, considerações sobre a aprendizagem e grupo de amizade"
                    placeholder="Sua resposta"
                    value={data.observacoesEducacao || ''}
                    onChange={(value) => onChange({ ...data, observacoesEducacao: value })}
                />
            </div>
        </div>
    );
}
