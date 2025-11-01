import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Eye, FileDown, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/ui/alert';
import type { SavedReport } from '../types';

interface SaveReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string) => Promise<SavedReport>;
  defaultTitle?: string;
  isLoading?: boolean;
}

export function SaveReportDialog({
  open,
  onOpenChange,
  onSave,
  defaultTitle = '',
  isLoading = false,
}: SaveReportDialogProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(defaultTitle);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedReport, setSavedReport] = useState<SavedReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset estados quando o dialog abre/fecha
  useEffect(() => {
    if (open) {
      setTitle(defaultTitle);
      setSaved(false);
      setSavedReport(null);
      setError(null);
    }
  }, [open, defaultTitle]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('O título do relatório é obrigatório');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const report = await onSave(title.trim());
      
      setSavedReport(report);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar relatório');
    } finally {
      setSaving(false);
    }
  };

  const handleViewReport = () => {
    if (savedReport) {
      navigate(`/app/relatorios/${savedReport.id}`);
      onOpenChange(false);
    }
  };

  const handleExportPdf = () => {
    // Fecha o dialog - o usuário pode usar o botão "Exportar PDF" da página
    onOpenChange(false);
  };

  const handleClose = () => {
    if (!saving) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!saved ? (
          <>
            <DialogHeader>
              <DialogTitle>Salvar Relatório</DialogTitle>
              <DialogDescription>
                Preencha as informações para salvar este relatório no sistema
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="report-title">
                  Título do Relatório <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="report-title"
                  placeholder="Ex: Relatório Mensal - Janeiro 2025"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={saving || isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Este título será usado para identificar o relatório na lista
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={saving || isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || isLoading || !title.trim()}
              >
                {saving || isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>Salvar Relatório</>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Relatório salvo com sucesso!
              </DialogTitle>
              <DialogDescription>
                O relatório foi salvo no sistema. O que deseja fazer agora?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              <Button
                type="button"
                variant="default"
                className="w-full justify-start"
                onClick={handleViewReport}
              >
                <Eye className="mr-2 h-4 w-4" />
                Visualizar Relatório
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={handleExportPdf}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Exportar como PDF
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleClose}
              >
                Fechar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
