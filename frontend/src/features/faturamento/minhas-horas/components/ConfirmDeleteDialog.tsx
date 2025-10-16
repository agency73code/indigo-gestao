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

interface ConfirmDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isDeleting?: boolean;
}

export function ConfirmDeleteDialog({
    open,
    onOpenChange,
    onConfirm,
    isDeleting = false,
}: ConfirmDeleteDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. O lançamento será permanentemente removido
                        do sistema.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isDeleting ? 'Excluindo...' : 'Excluir'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
