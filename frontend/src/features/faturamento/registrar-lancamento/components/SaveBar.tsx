import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SaveBarProps {
    onSave: () => void;
    onCancel: () => void;
    isSaving: boolean;
    canSave: boolean;
    validationMessage?: string;
}

// Componente reutilizável para os botões de salvamento
function SaveButtons({
    onSave,
    onCancel,
    isSaving,
    canSave,
}: {
    onSave: () => void;
    onCancel: () => void;
    isSaving: boolean;
    canSave: boolean;
}) {
    return (
        <div className="space-y-3 w-full">
            {/* Botões */}
            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                    onClick={onSave}
                    disabled={!canSave || isSaving}
                    className="h-12 sm:w-auto rounded-[5px]"
                    size="lg"
                >
                    {isSaving ? (
                        <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Salvando lançamento...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar lançamento
                        </>
                    )}
                </Button>

                <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="h-12 sm:w-auto rounded-[5px]"
                    size="lg"
                >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                </Button>
            </div>

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

export default function SaveBar({ onSave, onCancel, isSaving, canSave }: SaveBarProps) {
    return (
        <>
            {/* Variante Mobile - fixed na parte inferior */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 p-4 sm:p-6 md:hidden flex justify-center">
                <SaveButtons
                    onSave={onSave}
                    onCancel={onCancel}
                    isSaving={isSaving}
                    canSave={canSave}
                />
            </div>

            {/* Variante Desktop/Tablet - estática no final (sem position fixed para não cortar) */}
            <div className="hidden md:flex justify-center items-center p-4 sm:p-6">
                <SaveButtons
                    onSave={onSave}
                    onCancel={onCancel}
                    isSaving={isSaving}
                    canSave={canSave}
                />
            </div>
        </>
    );
}
