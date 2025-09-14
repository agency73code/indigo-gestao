import { Save, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SaveBarProps {
    onSave: () => void;
    onSaveAsVersion: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    isSaving?: boolean;
    isCreatingVersion?: boolean;
    hasChanges?: boolean;
}

export default function SaveBar({
    onSave,
    onSaveAsVersion,
    onCancel,
    isLoading = false,
    isSaving = false,
    isCreatingVersion = false,
    hasChanges = false,
}: SaveBarProps) {
    const disabled = isLoading || isSaving || isCreatingVersion;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-10">
            <div className="max-w-lg mx-auto p-4">
                <div className="flex gap-3">
                    {/* Botão primário - Salvar */}
                    <Button
                        onClick={onSave}
                        disabled={disabled || !hasChanges}
                        className="flex-1 h-12 text-sm font-medium"
                        size="lg"
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Salvar alterações
                            </>
                        )}
                    </Button>

                    {/* Botão secundário - Nova versão */}
                    <Button
                        onClick={onSaveAsVersion}
                        disabled={disabled}
                        variant="outline"
                        className="h-12 text-sm font-medium px-3"
                        size="lg"
                        title="Salvar como nova versão"
                    >
                        {isCreatingVersion ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Botão de cancelar */}
                <div className="flex justify-center mt-3">
                    <Button
                        onClick={onCancel}
                        disabled={disabled}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground h-8"
                    >
                        <X className="h-3 w-3 mr-2" />
                        Cancelar
                    </Button>
                </div>

                {/* Indicador de alterações */}
                {hasChanges && !disabled && (
                    <div className="flex justify-center mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            Alterações não salvas
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
