/**
 * Componente de Avaliação do Atendimento
 * Estilo Google Forms
 */

import { AutoExpandTextarea } from '@/components/ui/auto-expand-textarea';
import type { ProntuarioFormData } from '../types';

interface AvaliacaoAtendimentoProps {
    data: ProntuarioFormData;
    onChange: (data: ProntuarioFormData) => void;
    fieldErrors?: Record<string, string>;
}

export default function AvaliacaoAtendimento({ 
    data, 
    onChange, 
    fieldErrors: _fieldErrors = {} 
}: AvaliacaoAtendimentoProps) {
    return (
        <div className="space-y-3">
            {/* Avaliação do Atendimento */}
            <div className="rounded-2xl border bg-white p-4">
                <AutoExpandTextarea
                    label="Avaliação do Atendimento"
                    description="Sugestões, encaminhamentos, evoluções e encerramento justificado"
                    placeholder="Sua resposta"
                    value={data.avaliacaoAtendimento || ''}
                    onChange={(value) => onChange({ ...data, avaliacaoAtendimento: value })}
                />
            </div>
            
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-sm text-muted-foreground">
                    💡 <strong>Nota:</strong> Este campo pode ser preenchido ao longo do acompanhamento ou ao final 
                    do processo terapêutico.
                </p>
            </div>
        </div>
    );
}
