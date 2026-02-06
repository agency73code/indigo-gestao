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

interface BulkConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
    loading?: boolean;
}

export default function BulkConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmText,
    cancelText = 'Cancelar',
    variant: _variant = 'default',
    loading = false,
}: BulkConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle 
                        style={{
                            fontSize: 'var(--page-title-font-size)',
                            fontWeight: 'var(--page-title-font-weight)',
                            fontFamily: 'var(--page-title-font-family)'
                        }}
                    >
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Processando...' : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
