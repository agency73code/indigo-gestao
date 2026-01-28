/**
 * ============================================================================
 * COMPONENTE: AtaBillingData
 * ============================================================================
 * 
 * Componente para solicitação de Ajuda de Custo/Reembolso de despesas.
 * 
 * Fluxo:
 * 1. Terapeuta responde "Sim" ou "Não" para ajuda de custo
 * 2. Se "Sim", informa descrição dos gastos e anexa comprovantes
 * 3. Ata é enviada para aprovação
 * 4. Gestor visualiza no GestaoFaturamentoHub e aprova/rejeita
 * 
 * ============================================================================
 */

import { useState, useCallback } from 'react';
import { 
    DollarSign,
    X as XIcon,
    FileText, 
    Image as ImageIcon, 
    File, 
    Trash2,
    Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextAreaField } from '@/ui/textarea-field';
import { FileUploadBox } from '@/ui/file-upload-box';

import type { 
    DadosFaturamentoAta, 
    ArquivoFaturamentoAta,
} from '../types/billing';

// ============================================
// TIPOS
// ============================================

export interface AtaBillingDataProps {
    /** Dados atuais de faturamento */
    value: DadosFaturamentoAta;
    /** Callback ao alterar dados */
    onChange: (dados: DadosFaturamentoAta) => void;
    /** Erros de validação */
    errors?: Record<string, string>;
    /** Se está desabilitado (salvando, etc) */
    disabled?: boolean;
}

// ============================================
// HELPERS
// ============================================

function getFileIcon(mimeType: string) {
    if (mimeType.startsWith('image/')) {
        return { Icon: ImageIcon, color: 'text-blue-600' };
    }
    if (mimeType === 'application/pdf') {
        return { Icon: FileText, color: 'text-red-600' };
    }
    return { Icon: File, color: 'text-gray-600' };
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function AtaBillingData({
    value,
    onChange,
    errors = {},
    disabled = false,
}: AtaBillingDataProps) {
    const [editingFileId, setEditingFileId] = useState<string | null>(null);
    const [editingFileName, setEditingFileName] = useState('');

    // Handlers
    const handleFieldChange = useCallback(<K extends keyof DadosFaturamentoAta>(
        field: K,
        fieldValue: DadosFaturamentoAta[K]
    ) => {
        onChange({
            ...value,
            [field]: fieldValue,
        });
    }, [value, onChange]);

    const handleAddFile = useCallback((file: File) => {
        const newFile: ArquivoFaturamentoAta = {
            id: `arq-fat-ata-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            nome: file.name,
            tipo: file.type,
            tamanho: file.size,
            file,
        };
        
        onChange({
            ...value,
            arquivosFaturamento: [...(value.arquivosFaturamento || []), newFile],
        });
    }, [value, onChange]);

    const handleRemoveFile = useCallback((fileId: string) => {
        onChange({
            ...value,
            arquivosFaturamento: (value.arquivosFaturamento || []).filter((f: ArquivoFaturamentoAta) => f.id !== fileId),
        });
    }, [value, onChange]);

    const handleRenameFile = useCallback((fileId: string, nome: string) => {
        onChange({
            ...value,
            arquivosFaturamento: (value.arquivosFaturamento || []).map((f: ArquivoFaturamentoAta) => 
                f.id === fileId ? { ...f, nome } : f
            ),
        });
    }, [value, onChange]);

    const startEditingFileName = (id: string, currentName: string) => {
        setEditingFileId(id);
        setEditingFileName(currentName);
    };

    const saveFileName = (id: string) => {
        if (editingFileName.trim()) {
            handleRenameFile(id, editingFileName.trim());
        }
        setEditingFileId(null);
        setEditingFileName('');
    };

    const cancelEditingFileName = () => {
        setEditingFileId(null);
        setEditingFileName('');
    };

    // Handler para toggle Sim/Não
    const handleToggleAjudaCusto = (temAjuda: boolean) => {
        onChange({
            ...value,
            temAjudaCusto: temAjuda,
            // Limpa campos se desmarcar
            ...(temAjuda ? {} : {
                motivoAjudaCusto: '',
                arquivosFaturamento: [],
            }),
        });
    };

    return (
        <div className="space-y-4">
            {/* Pergunta Sim/Não */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">
                    Ajuda de Custo<span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => handleToggleAjudaCusto(true)}
                        disabled={disabled}
                        className={cn(
                            'flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all',
                            value.temAjudaCusto
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border hover:border-muted-foreground/50'
                        )}
                    >
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">Sim</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleToggleAjudaCusto(false)}
                        disabled={disabled}
                        className={cn(
                            'flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all',
                            !value.temAjudaCusto
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border hover:border-muted-foreground/50'
                        )}
                    >
                        <XIcon className="h-4 w-4" />
                        <span className="font-medium">Não</span>
                    </button>
                </div>
            </div>

            {/* Campos condicionais - aparecem apenas se Sim */}
            {value.temAjudaCusto && (
                <div className="space-y-4 pt-2">
                    {/* Descrição/Motivo dos gastos */}
                    <TextAreaField
                        label="Ajuda de Custo - Descrição"
                        value={value.motivoAjudaCusto || ''}
                        onChange={(e) => handleFieldChange('motivoAjudaCusto', e.target.value)}
                        placeholder="Ex: Estacionamento R$ 25,00 • Uber R$ 35,00 • Material impresso R$ 15,00"
                        rows={3}
                        disabled={disabled}
                        error={errors.motivoAjudaCusto}
                    />

                    {/* Comprovantes */}
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium">
                                Comprovantes (recibos, notas fiscais, tickets)
                            </label>
                        </div>

                        <FileUploadBox
                            onChange={(file) => file && handleAddFile(file)}
                            disabled={disabled}
                            accept="image/*,application/pdf,.doc,.docx"
                        />

                        {/* Lista de arquivos */}
                        {value.arquivosFaturamento && value.arquivosFaturamento.length > 0 && (
                            <div className="space-y-2">
                                {value.arquivosFaturamento.map((arquivo) => {
                                    const { Icon, color } = getFileIcon(arquivo.tipo);
                                    const isEditing = editingFileId === arquivo.id;

                                    return (
                                        <div
                                            key={arquivo.id}
                                            className="flex items-center gap-3 p-3 bg-muted/50 rounded-md group"
                                        >
                                            <Icon className={cn('h-5 w-5 shrink-0', color)} />
                                            
                                            <div className="flex-1 min-w-0">
                                                {isEditing ? (
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={editingFileName}
                                                            onChange={(e) => setEditingFileName(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveFileName(arquivo.id);
                                                                if (e.key === 'Escape') cancelEditingFileName();
                                                            }}
                                                            className="h-8"
                                                            autoFocus
                                                        />
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={() => saveFileName(arquivo.id)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={cancelEditingFileName}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <XIcon className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p
                                                            className="text-sm font-medium truncate cursor-pointer hover:text-primary"
                                                            onClick={() => startEditingFileName(arquivo.id, arquivo.nome)}
                                                        >
                                                            {arquivo.nome}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatFileSize(arquivo.tamanho)}
                                                        </p>
                                                    </>
                                                )}
                                            </div>

                                            {!isEditing && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleRemoveFile(arquivo.id)}
                                                    disabled={disabled}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
