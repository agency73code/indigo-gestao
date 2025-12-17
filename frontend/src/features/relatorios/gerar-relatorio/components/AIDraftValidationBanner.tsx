/**
 * Banner de validação obrigatória para rascunhos gerados por IA
 * Força o terapeuta a revisar e aprovar o conteúdo antes de salvar
 */

import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIDraftValidationBannerProps {
    onValidate: () => void;
}

export function AIDraftValidationBanner({ onValidate }: AIDraftValidationBannerProps) {
    return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">
                        Rascunho gerado por IA — validação clínica obrigatória
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                        Revise o texto abaixo, faça as edições necessárias e clique em{' '}
                        <strong>"Validar Rascunho"</strong> para confirmar que o conteúdo 
                        está clinicamente adequado. O relatório só poderá ser salvo após a validação.
                    </p>
                    <Button
                        size="sm"
                        onClick={onValidate}
                        className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
                    >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Validar Rascunho
                    </Button>
                </div>
            </div>
        </div>
    );
}
