/**
 * Componente de Objetivos de Trabalho
 * Estilo Google Forms
 */

import { AutoExpandTextarea } from '@/components/ui/auto-expand-textarea';
import type { ProntuarioFormData } from '../types';

interface ObjetivosTrabalhoProps {
    data: ProntuarioFormData;
    onChange: (data: ProntuarioFormData) => void;
    fieldErrors?: Record<string, string>;
}

export default function ObjetivosTrabalho({ 
    data, 
    onChange, 
    fieldErrors = {} 
}: ObjetivosTrabalhoProps) {
    return (
        <div className="space-y-3">
            {/* Objetivos de Trabalho */}
            <div className="rounded-2xl border bg-white p-4">
                <AutoExpandTextarea
                    label="Objetivos de Trabalho"
                    description="Procedimentos técnico-científicos e base teórico-científica utilizada"
                    placeholder="Sua resposta"
                    value={data.objetivosTrabalho || ''}
                    onChange={(value) => onChange({ ...data, objetivosTrabalho: value })}
                    required
                    error={fieldErrors.objetivosTrabalho}
                />
            </div>
            
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-sm text-muted-foreground">
                    💡 <strong>Dica:</strong> Inclua os objetivos terapêuticos, abordagem metodológica 
                    e procedimentos técnico-científicos do tratamento.
                </p>
            </div>
        </div>
    );
}
