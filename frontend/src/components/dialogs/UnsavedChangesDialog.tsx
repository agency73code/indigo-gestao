/**
 * Dialog de confirmação para sair com alterações não salvas
 */

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UnsavedChangesDialogProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    description?: string;
}

export function UnsavedChangesDialog({
    open,
    onConfirm,
    onCancel,
    title = 'Anamnese em andamento',
    description = 'Você tem uma anamnese em andamento que não foi salva. Se sair agora, todos os dados preenchidos serão perdidos. Deseja continuar?',
}: UnsavedChangesDialogProps) {
    return (
        <AlertDialog open={open}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-sora font-normal text-lg text-foreground">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-muted-foreground">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3 sm:gap-3">
                    <AlertDialogCancel 
                        onClick={onCancel}
                        className="border border-input bg-background hover:bg-accent"
                    >
                        Continuar editando
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={onConfirm}
                        className="bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                    >
                        Sair sem salvar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default UnsavedChangesDialog;
