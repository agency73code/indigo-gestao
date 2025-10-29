import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Archive, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { ArchiveDialogProps } from '../types';

export default function ArchiveDialog({
    open,
    onClose,
    onConfirm,
    link,
    loading = false,
}: ArchiveDialogProps) {
    const handleSubmit = () => {
        onConfirm();
    };

    if (!link) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-[95vw] sm:w-full mx-auto rounded-[5px]">
                <DialogHeader>
                    <DialogTitle
                        style={{ fontFamily: 'Sora, sans-serif' }}
                        className="text-base sm:text-lg font-semibold flex items-center gap-2">
                        <Archive className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500" />
                        Arquivar Vínculo
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                        Tem certeza que deseja arquivar este vínculo? O registro será movido para o
                        arquivo histórico e não aparecerá mais nas listagens ativas.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Informações do vínculo */}
                    <div className="bg-muted/50 rounded-md p-4">
                        <h4 className="text-sm font-medium mb-3">Detalhes do Vínculo</h4>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex justify-between">
                                <span>Data de início:</span>
                                <span className="font-medium">
                                    {link.startDate &&
                                        format(new Date(link.startDate), 'dd/MM/yyyy')}
                                </span>
                            </div>
                            {link.endDate && (
                                <div className="flex justify-between">
                                    <span>Data de encerramento:</span>
                                    <span className="font-medium">
                                        {format(new Date(link.endDate), 'dd/MM/yyyy')}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Área de atuação:</span>
                                <span className="font-medium">
                                    {link.actuationArea || 'Atuação não definida'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Status atual:</span>
                                <span
                                    className={`font-medium ${
                                        link.status === 'active'
                                            ? 'text-green-600'
                                            : link.status === 'ended'
                                              ? 'text-amber-600'
                                              : 'text-slate-500'
                                    }`}
                                >
                                    {link.status === 'active'
                                        ? 'Ativo'
                                        : link.status === 'ended'
                                          ? 'Encerrado'
                                          : 'Arquivado'}
                                </span>
                            </div>
                            {link.notes && (
                                <div>
                                    <span className="block mb-1">Observações:</span>
                                    <p className="font-medium text-foreground text-xs p-2 bg-background rounded border">
                                        {link.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Aviso importante */}
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                        <div className="flex">
                            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-amber-800">
                                    O que acontece ao arquivar?
                                </h3>
                                <div className="mt-2 text-sm text-amber-700">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>O vínculo será movido para o arquivo histórico</li>
                                        <li>Não aparecerá mais nas listagens ativas</li>
                                        <li>Poderá ser restaurado se necessário</li>
                                        <li>Todos os dados serão preservados</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-3 flex-col sm:flex-row">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="w-full sm:w-auto order-2 sm:order-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        variant="secondary"
                        className="w-full sm:w-auto gap-2 order-1 sm:order-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        <Archive className="h-4 w-4" />
                        <span className="sm:hidden">Arquivar</span>
                        <span className="hidden sm:inline">Arquivar Vínculo</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
