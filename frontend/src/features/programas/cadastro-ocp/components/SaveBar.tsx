import { Save, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SaveBarProps {
    onSave: () => void;
    onSaveAndStart: () => void;
    onCancel: () => void;
    isSaving: boolean;
    canSave: boolean;
    patientName?: string;
}

export default function SaveBar({
    onSave,
    onSaveAndStart,
    onCancel,
    isSaving,
    canSave,
    patientName,
}: SaveBarProps) {
    return (
        <div className="bg-background border-t z-40 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Botões principais */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
                    <Button
                        onClick={onSave}
                        disabled={!canSave || isSaving}
                        className="flex-1 p-3 rounded-[5px] sm:flex-none h-12 sm:h-11 gap-2 font-medium"
                        size="lg"
                    >
                        {isSaving ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Salvar Programa
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={onSaveAndStart}
                        disabled={!canSave || isSaving}
                        variant="secondary"
                        className="flex-1 p-3 rounded-[5px] sm:flex-none h-12 sm:h-11 gap-2 font-medium"
                        size="lg"
                    >
                        <Play className="h-4 w-4" />
                        Salvar e Iniciar Sessão
                    </Button>
                </div>

                {/* Botão cancelar */}
                <Button
                    onClick={onCancel}
                    variant="ghost"
                    disabled={isSaving}
                    className="h-12 sm:h-11 gap-2 sm:w-auto"
                    size="lg"
                >
                    <X className="h-4 w-4" />
                    Cancelar
                </Button>
            </div>

            {/* Informações de contexto no mobile */}
            {patientName && (
                <div className="text-center mt-3 sm:hidden">
                    <p className="text-xs text-muted-foreground">
                        Programa para <span className="font-medium">{patientName}</span>
                    </p>
                </div>
            )}

            {/* Mensagem de validação */}
            {!canSave && !isSaving && (
                <div className="text-center mt-3">
                    <p className="text-xs text-muted-foreground">
                        Complete os campos obrigatórios para salvar
                    </p>
                </div>
            )}
        </div>
    );
}
