/**
 * ============================================================================
 * COMPONENTE: BillingCorrectionForm
 * ============================================================================
 * 
 * Formulário para correção de faturamento com TODOS os tipos de atividade.
 * Diferente do SessionBillingData que só tem consultório/homecare.
 * 
 * TIPOS DE ATIVIDADE:
 * - Consultório
 * - Homecare
 * - Reunião
 * - Supervisão Recebida
 * - Supervisão Dada
 * - Desenvolvimento de Materiais
 * 
 * ============================================================================
 */

import { useState, useCallback } from 'react';
import { 
    Building2, 
    Home, 
    Users,
    GraduationCap,
    BookOpen,
    Wrench,
    DollarSign, 
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
import { DateFieldWithLabel } from '@/ui/date-field-with-label';
import { TimeFieldWithLabel } from '@/ui/time-field-with-label';
import { TextAreaField } from '@/ui/textarea-field';
import { FileUploadBox } from '@/ui/file-upload-box';

import type { DadosFaturamentoSessao, ArquivoFaturamento } from '@/features/programas/core/types/billing';
import { calcularDuracaoMinutos, formatarDuracao } from '@/features/programas/core/types/billing';
import {
    TIPO_ATIVIDADE_FATURAMENTO,
    TIPO_ATIVIDADE_FATURAMENTO_LABELS,
    type TipoAtividadeFaturamento,
} from '../types/faturamento.types';

// ============================================
// TIPOS
// ============================================

// Estende DadosFaturamentoSessao para incluir tipoAtividade
export interface DadosFaturamentoCorrecao extends Omit<DadosFaturamentoSessao, 'tipoAtendimento'> {
    tipoAtividade: TipoAtividadeFaturamento;
    tipoAtendimento?: 'consultorio' | 'homecare'; // mantém compatibilidade
}

export interface BillingCorrectionFormProps {
    /** Dados atuais de faturamento */
    value: DadosFaturamentoCorrecao;
    /** Callback ao alterar dados */
    onChange: (dados: DadosFaturamentoCorrecao) => void;
    /** Erros de validação */
    errors?: Record<string, string>;
    /** Se está desabilitado */
    disabled?: boolean;
    /** Título customizado da seção */
    title?: string;
    /** Se deve iniciar expandido */
    defaultExpanded?: boolean;
}

// ============================================
// CONFIGURAÇÃO DOS TIPOS DE ATIVIDADE
// ============================================

const TIPOS_ATIVIDADE_CONFIG = [
    { 
        value: TIPO_ATIVIDADE_FATURAMENTO.CONSULTORIO, 
        label: 'Consultório', 
        icon: Building2,
        temAjudaCusto: false,
    },
    { 
        value: TIPO_ATIVIDADE_FATURAMENTO.HOMECARE, 
        label: 'Homecare', 
        icon: Home,
        temAjudaCusto: true,
    },
    { 
        value: TIPO_ATIVIDADE_FATURAMENTO.REUNIAO, 
        label: 'Reunião', 
        icon: Users,
        temAjudaCusto: false,
    },
    { 
        value: TIPO_ATIVIDADE_FATURAMENTO.SUPERVISAO_RECEBIDA, 
        label: 'Supervisão Recebida', 
        icon: GraduationCap,
        temAjudaCusto: false,
    },
    { 
        value: TIPO_ATIVIDADE_FATURAMENTO.SUPERVISAO_DADA, 
        label: 'Supervisão Dada', 
        icon: BookOpen,
        temAjudaCusto: false,
    },
    { 
        value: TIPO_ATIVIDADE_FATURAMENTO.DESENVOLVIMENTO_MATERIAIS, 
        label: 'Desenv. Materiais', 
        icon: Wrench,
        temAjudaCusto: false,
    },
];

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

export function BillingCorrectionForm({
    value,
    onChange,
    errors = {},
    disabled = false,
    title = 'Dados de Faturamento',
    defaultExpanded = true,
}: BillingCorrectionFormProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const [editingFileId, setEditingFileId] = useState<string | null>(null);
    const [editingFileName, setEditingFileName] = useState('');

    // Handlers
    const handleFieldChange = useCallback(<K extends keyof DadosFaturamentoCorrecao>(
        field: K,
        fieldValue: DadosFaturamentoCorrecao[K]
    ) => {
        onChange({
            ...value,
            [field]: fieldValue,
        });
    }, [value, onChange]);

    const handleTipoAtividadeChange = useCallback((tipo: TipoAtividadeFaturamento) => {
        const config = TIPOS_ATIVIDADE_CONFIG.find(t => t.value === tipo);
        onChange({
            ...value,
            tipoAtividade: tipo,
            // Atualizar tipoAtendimento para compatibilidade
            tipoAtendimento: tipo === 'homecare' ? 'homecare' : tipo === 'consultorio' ? 'consultorio' : value.tipoAtendimento,
            // Limpar ajuda de custo se não for homecare
            ajudaCusto: config?.temAjudaCusto ? value.ajudaCusto : null,
        });
    }, [value, onChange]);

    const handleAddFile = useCallback((file: File) => {
        const newFile: ArquivoFaturamento = {
            id: `arq-fat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
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
            arquivosFaturamento: (value.arquivosFaturamento || []).filter((f: ArquivoFaturamento) => f.id !== fileId),
        });
    }, [value, onChange]);

    const handleRenameFile = useCallback((fileId: string, nome: string) => {
        onChange({
            ...value,
            arquivosFaturamento: (value.arquivosFaturamento || []).map((f: ArquivoFaturamento) =>
                f.id === fileId ? { ...f, nome } : f
            ),
        });
    }, [value, onChange]);

    const startEditingFileName = (fileId: string, currentName: string) => {
        setEditingFileId(fileId);
        setEditingFileName(currentName);
    };

    const saveFileName = (fileId: string) => {
        if (editingFileName.trim()) {
            handleRenameFile(fileId, editingFileName.trim());
        }
        setEditingFileId(null);
        setEditingFileName('');
    };

    const cancelEditingFileName = () => {
        setEditingFileId(null);
        setEditingFileName('');
    };

    // Calcular duração se horários preenchidos
    const duracao = value.horarioInicio && value.horarioFim
        ? calcularDuracaoMinutos(value.horarioInicio, value.horarioFim)
        : null;

    // Verificar se o tipo atual tem ajuda de custo
    const tipoAtualConfig = TIPOS_ATIVIDADE_CONFIG.find(t => t.value === value.tipoAtividade);
    const temAjudaCusto = tipoAtualConfig?.temAjudaCusto ?? false;

    return (
        <div className={title ? "bg-card border rounded-lg overflow-hidden" : ""}>
            {/* Header colapsável - só mostra se houver título */}
            {title && (
                <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    onClick={() => setExpanded(!expanded)}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-medium">{title}</h3>
                            <p className="text-sm text-muted-foreground">
                                {TIPO_ATIVIDADE_FATURAMENTO_LABELS[value.tipoAtividade] || 'Não definido'}
                                {duracao && duracao > 0 && (
                                    <span className="ml-2">• {formatarDuracao(duracao)}</span>
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
            )}

            {/* Conteúdo */}
            {(expanded || !title) && (
                <div className={cn("space-y-6", title && "p-4 pt-0")}>
                    {/* Data e Horários */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DateFieldWithLabel
                            label="Data da Sessão*"
                            value={value.dataSessao}
                            onChange={(date) => handleFieldChange('dataSessao', date)}
                            placeholder="Selecione"
                            error={errors.dataSessao}
                            maxDate={new Date()}
                            disabled={disabled ? () => true : undefined}
                        />

                        <TimeFieldWithLabel
                            label="Horário Início*"
                            value={value.horarioInicio}
                            onChange={(time) => handleFieldChange('horarioInicio', time)}
                            placeholder="Selecione"
                            error={errors.horarioInicio}
                            disabled={disabled}
                        />

                        <TimeFieldWithLabel
                            label="Horário Fim*"
                            value={value.horarioFim}
                            onChange={(time) => handleFieldChange('horarioFim', time)}
                            placeholder="Selecione"
                            error={errors.horarioFim}
                            disabled={disabled}
                        />
                    </div>

                    {/* Tipo de Atividade - Grid com todos os tipos */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            Tipo de Atividade<span className="text-destructive">*</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {TIPOS_ATIVIDADE_CONFIG.map((tipo) => {
                                const Icon = tipo.icon;
                                const isSelected = value.tipoAtividade === tipo.value;
                                
                                return (
                                    <button
                                        key={tipo.value}
                                        type="button"
                                        onClick={() => handleTipoAtividadeChange(tipo.value)}
                                        disabled={disabled}
                                        className={cn(
                                            "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all cursor-pointer",
                                            isSelected
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-muted hover:border-muted-foreground/30 hover:bg-muted/20",
                                            disabled && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="font-medium text-sm">{tipo.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Ajuda de Custo (só para homecare) */}
                    {temAjudaCusto && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                Ajuda de Custo<span className="text-destructive">*</span>
                            </label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleFieldChange('ajudaCusto', true)}
                                    disabled={disabled}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer",
                                        value.ajudaCusto === true
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-muted hover:border-muted-foreground/30 hover:bg-muted/20",
                                        disabled && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <Check className="h-5 w-5" />
                                    <span className="font-medium">Sim</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleFieldChange('ajudaCusto', false)}
                                    disabled={disabled}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer",
                                        value.ajudaCusto === false
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-muted hover:border-muted-foreground/30 hover:bg-muted/20",
                                        disabled && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <X className="h-5 w-5" />
                                    <span className="font-medium">Não</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Observações de Faturamento */}
                    <div className="space-y-2">
                        <TextAreaField
                            label="Ajuda de Custo - Descrição"
                            value={value.observacaoFaturamento || ''}
                            onChange={(e) => handleFieldChange('observacaoFaturamento', e.target.value)}
                            placeholder="Descreva os gastos com transporte, materiais, etc..."
                            disabled={disabled}
                            rows={3}
                        />
                    </div>

                    {/* Arquivos/Comprovantes */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground">
                            Comprovantes (recibos, notas fiscais, tickets)
                        </label>
                        
                        <FileUploadBox
                            onChange={(file) => file && handleAddFile(file)}
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp4,.mov"
                            maxSize={10}
                            allowedTypes="PDF, DOC, PNG, JPG, MP4, MOV"
                            disabled={disabled}
                        />

                        {/* Lista de arquivos */}
                        {value.arquivosFaturamento && value.arquivosFaturamento.length > 0 && (
                            <div className="space-y-2">
                                {value.arquivosFaturamento.map((arquivo: ArquivoFaturamento) => {
                                    const { Icon, color } = getFileIcon(arquivo.tipo);
                                    const isEditing = editingFileId === arquivo.id;
                                    
                                    return (
                                        <div 
                                            key={arquivo.id}
                                            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                                        >
                                            <Icon className={cn("h-5 w-5 shrink-0", color)} />
                                            
                                            {isEditing ? (
                                                <div className="flex-1 flex items-center gap-2">
                                                    <Input
                                                        value={editingFileName}
                                                        onChange={(e) => setEditingFileName(e.target.value)}
                                                        className="h-8 text-sm"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') saveFileName(arquivo.id);
                                                            if (e.key === 'Escape') cancelEditingFileName();
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => saveFileName(arquivo.id)}
                                                    >
                                                        <Check className="h-4 w-4 text-green-600" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={cancelEditingFileName}
                                                    >
                                                        <X className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div 
                                                        className="flex-1 min-w-0 cursor-pointer hover:text-primary transition-colors"
                                                        onClick={() => startEditingFileName(arquivo.id, arquivo.nome)}
                                                        title="Clique para editar o nome"
                                                    >
                                                        <p className="text-sm truncate">{arquivo.nome}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatFileSize(arquivo.tamanho)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile(arquivo.id)}
                                                        disabled={disabled}
                                                        className={cn(
                                                            "flex items-center justify-center h-9 w-9 rounded-full shrink-0",
                                                            "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40",
                                                            "transition-colors",
                                                            disabled && "opacity-50 cursor-not-allowed"
                                                        )}
                                                        title="Remover arquivo"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                    </button>
                                                </>
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

export default BillingCorrectionForm;
