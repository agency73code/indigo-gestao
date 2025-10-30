import { Loader2, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import type { ArchiveSupervisionDialogProps } from '../types';

export default function ArchiveSupervisionDialog({
    open,
    onClose,
    onConfirm,
    link,
    loading = false,
}: ArchiveSupervisionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-[95vw] sm:w-full mx-auto rounded-[5px]">
                <DialogHeader>
                    <DialogTitle
                        style={{ fontFamily: 'Sora, sans-serif' }}
                        className="text-lg sm:text-xl font-semibold flex items-center gap-2"
                    >
                        <Archive className="h-5 w-5" />
                        Arquivar Vínculo de Supervisão
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Tem certeza que deseja arquivar este vínculo de supervisão? Esta ação pode ser
                        revertida posteriormente.
                    </DialogDescription>
                </DialogHeader>

                {link && (
                    <div className="py-4">
                        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                            <div className="text-sm">
                                <span className="text-muted-foreground">Status atual:</span>{' '}
                                <span className="font-medium">
                                    {link.status === 'active' ? 'Ativo' : 'Encerrado'}
                                </span>
                            </div>
                            {link.startDate && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Data de início:</span>{' '}
                                    <span className="font-medium">
                                        {new Date(link.startDate).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            )}
                            {link.endDate && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Data de encerramento:</span>{' '}
                                    <span className="font-medium">
                                        {new Date(link.endDate).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 sm:flex-none"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 sm:flex-none gap-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        <Archive className="h-4 w-4" />
                        Arquivar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
