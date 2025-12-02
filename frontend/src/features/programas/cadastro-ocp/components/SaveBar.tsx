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

// Componente reutilizável para os botões de salvamento
function SaveButtons({
    onSave,
    onSaveAndStart,
    onCancel,
    isSaving,
    canSave,
    patientName,
}: {
    onSave: () => void;
    onSaveAndStart: () => void;
    onCancel: () => void;
    isSaving: boolean;
    canSave: boolean;
    patientName?: string;
}) {
    return (
        <div className="">
            <div className="max-w-62 mx-auto flex flex-row gap-2 sm:gap-4">
                {/* Botões principais */}
                <div className="flex flex-row gap-2 sm:gap-3 flex-1">
                    {/* Botão Salvar */}
                    <Button
                        onClick={onSave}
                        disabled={isSaving}
                        className="flex-1 sm:flex-none h-10 sm:h-11 px-4 sm:px-6 rounded-full gap-2 font-medium text-sm"
                    >
                        {isSaving ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                <span className="hidden sm:inline">Salvando...</span>
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 hidden sm:block" />
                                <span className="hidden sm:inline">Salvar Programa</span>
                                <span className="sm:hidden">Salvar</span>
                            </>
                        )}
                    </Button>

                    {/* Botão Salvar e Iniciar - Circular no mobile */}
                    <Button
                        onClick={onSaveAndStart}
                        disabled={!canSave || isSaving}
                        variant="secondary"
                        className="h-10 w-10 sm:w-auto sm:h-11 sm:px-6 rounded-full gap-2 font-medium p-0 sm:p-3"
                        size="lg"
                    >
                        <Play className="h-4 w-4" />
                        <span className="hidden sm:inline">Salvar e Iniciar Sessão</span>
                    </Button>
                </div>

                {/* Botão cancelar - Só ícone no mobile */}
                <Button
                    onClick={onCancel}
                    variant="ghost"
                    disabled={isSaving}
                    className="h-10 w-10 sm:h-11 sm:w-auto sm:px-4 p-0 sm:p-3 gap-2"
                    size="lg"
                >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Cancelar</span>
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

export default function SaveBar({
    onSave,
    onSaveAndStart,
    onCancel,
    isSaving,
    canSave,
    patientName,
}: SaveBarProps) {
    return (
        <>
            {/* Variante Mobile - com o comportamento atual de animação */}
            <div className="bg-background border-t z-50 p-4 sm:p-6 md:hidden">
                <SaveButtons
                    onSave={onSave}
                    onSaveAndStart={onSaveAndStart}
                    onCancel={onCancel}
                    isSaving={isSaving}
                    canSave={canSave}
                    patientName={patientName}
                />
            </div>

            {/* Variante Desktop/Tablet - sticky dentro do container */}
            <div className="hidden md:block bottom-0 z-30 backdrop-blur p-4 sm:p-6">
                <SaveButtons
                    onSave={onSave}
                    onSaveAndStart={onSaveAndStart}
                    onCancel={onCancel}
                    isSaving={isSaving}
                    canSave={canSave}
                    patientName={patientName}
                />
            </div>
        </>
    );
}
