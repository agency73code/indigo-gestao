/**
 * ============================================================================
 * COMPONENTE: AtaBillingData
 * ============================================================================
 * 
 * Componente para captura de COMPROVANTES de pagamento das horas da ata.
 * 
 * CAMPOS:
 * - Observações do pagamento (dados bancários, NF, etc)
 * - Arquivos (comprovantes de transferência, recibos, notas fiscais)
 * 
 * IMPORTANTE: 
 * - O tipo de faturamento é determinado automaticamente pela finalidade da reunião
 * - A duração é calculada pelos horários início/fim da ata
 * - O valor será calculado pelo backend com base no cadastro do terapeuta
 * 
 * Este componente serve para DOCUMENTAR O PAGAMENTO após recebê-lo.
 * 
 * ============================================================================
 */

import { useState, useCallback } from 'react';
import { 
    Wallet,
    Info,
    X, 
    FileText, 
    Image as ImageIcon, 
    File, 
    Trash2,
    Check,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    /** Se deve iniciar expandido */
    defaultExpanded?: boolean;
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
    defaultExpanded = true,
}: AtaBillingDataProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const [editingFileId, setEditingFileId] = useState<string | null>(null);
    const [editingFileName, setEditingFileName] = useState('');

    const arquivosCount = value.arquivosFaturamento?.length || 0;

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

    return (
        <div className="bg-card border rounded-lg overflow-hidden">
            {/* Header colapsável */}
            <button
                type="button"
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                        <Wallet className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-medium">Ajuda de Custo</h3>
                        <p className="text-sm text-muted-foreground">
                            Anexe comprovantes de despesas para reembolso
                            {arquivosCount > 0 && (
                                <span className="ml-2">• {arquivosCount} arquivo{arquivosCount > 1 ? 's' : ''}</span>
                            )}
                        </p>
                    </div>
                </div>
                {expanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
            </button>

            {/* Conteúdo */}
            {expanded && (
                <div className="p-4 pt-0 space-y-4">
                    {/* Banner explicativo */}
                    <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                            <p className="font-medium">
                                Teve alguma despesa relacionada a esta reunião?
                            </p>
                            <p className="text-blue-600 dark:text-blue-300 mt-1">
                                Anexe os comprovantes e descreva os gastos para solicitar reembolso.
                            </p>
                        </div>
                    </div>

                    {/* Descrição da Despesa */}
                    <TextAreaField
                        label="Descrição da Despesa"
                        value={value.observacaoFaturamento || ''}
                        onChange={(val) => handleFieldChange('observacaoFaturamento', val)}
                        placeholder="Ex: Estacionamento R$ 25,00 • Uber R$ 35,00 • Material R$ 15,00"
                        rows={1}
                        disabled={disabled}
                        error={errors.observacaoFaturamento}
                    />

                    {/* Comprovantes */}
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium">
                                Comprovantes
                            </label>
                            <p className="text-xs text-muted-foreground mt-1">
                                Recibos, notas fiscais, tickets de estacionamento, etc.
                            </p>
                        </div>

                        <FileUploadBox
                            onFileSelect={handleAddFile}
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
                                            <Icon className={cn('h-5 w-5 flex-shrink-0', color)} />
                                            
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
                                                            <X className="h-4 w-4" />
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
