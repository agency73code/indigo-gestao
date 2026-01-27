/**
 * ============================================================================
 * COMPONENTE: SessionBillingData
 * ============================================================================
 * 
 * Componente para captura de dados de faturamento em sessões de terapia.
 * 
 * CAMPOS:
 * - Data da sessão (editável, default: hoje)
 * - Horário início e fim
 * - Tipo de atendimento (consultório/homecare)
 * - Ajuda de custo (só para homecare)
 * - Observações de faturamento (separadas das observações clínicas)
 * - Arquivos de faturamento (comprovantes, recibos, etc)
 * 
 * IMPORTANTE: Este componente é separado das observações/arquivos clínicos
 * para manter os dados de faturamento organizados.
 * 
 * ============================================================================
 */

import { useState, useCallback } from 'react';
import { 
    Building2, 
    Home, 
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

import type { 
    DadosFaturamentoSessao, 
    ArquivoFaturamento,
    TipoAtendimento,
} from '@/features/programas/core/types/billing';
import { 
    TIPO_ATENDIMENTO, 
    TIPO_ATENDIMENTO_LABELS,
    calcularDuracaoMinutos,
    formatarDuracao,
} from '@/features/programas/core/types/billing';

// ============================================
// TIPOS
// ============================================

export interface SessionBillingDataProps {
    /** Dados atuais de faturamento (alias: billing) */
    value?: DadosFaturamentoSessao;
    /** Alias para value - dados atuais de faturamento */
    billing?: DadosFaturamentoSessao;
    /** Callback ao alterar dados */
    onChange: (dados: DadosFaturamentoSessao) => void;
    /** Erros de validação */
    errors?: Record<string, string>;
    /** Se está desabilitado (salvando, etc) */
    disabled?: boolean;
    /** Título customizado da seção */
    title?: string;
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

function getLocalIsoDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function SessionBillingData({
    value: valueProp,
    billing,
    onChange,
    errors = {},
    disabled = false,
    title = 'Dados de Faturamento',
    defaultExpanded = true,
}: SessionBillingDataProps) {
    // Usar billing como alias de value
    const value = valueProp || billing || {
        dataSessao: getLocalIsoDate(),
        horarioInicio: '',
        horarioFim: '',
        tipoAtendimento: TIPO_ATENDIMENTO.CONSULTORIO,
        ajudaCusto: undefined,
        observacaoFaturamento: '',
        arquivosFaturamento: [],
    };

    const [expanded, setExpanded] = useState(defaultExpanded);
    const [editingFileId, setEditingFileId] = useState<string | null>(null);
    const [editingFileName, setEditingFileName] = useState('');

    // Handlers
    const handleFieldChange = useCallback(<K extends keyof DadosFaturamentoSessao>(
        field: K,
        fieldValue: DadosFaturamentoSessao[K]
    ) => {
        onChange({
            ...value,
            [field]: fieldValue,
        });
    }, [value, onChange]);

    const handleTipoAtendimentoChange = useCallback((tipo: TipoAtendimento) => {
        onChange({
            ...value,
            tipoAtendimento: tipo,
            // Limpar ajuda de custo se mudar para consultório
            ajudaCusto: tipo === TIPO_ATENDIMENTO.HOMECARE ? value.ajudaCusto : undefined,
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

    // Calcular duração se horários preenchidos
    const duracao = value.horarioInicio && value.horarioFim
        ? calcularDuracaoMinutos(value.horarioInicio, value.horarioFim)
        : null;

    return (
        <div className="bg-card border rounded-lg overflow-hidden">
            {/* Header colapsável */}
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
                            {value.tipoAtendimento === TIPO_ATENDIMENTO.HOMECARE 
                                ? 'Homecare' 
                                : 'Consultório'}
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

            {/* Conteúdo */}
            {expanded && (
                <div className="p-4 pt-0 space-y-6">
                    {/* Data e Horários */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                    {/* Duração calculada */}
                    {duracao !== null && duracao > 0 && (
                        <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                            Duração da sessão: <span className="font-medium text-foreground">{formatarDuracao(duracao)}</span>
                        </div>
                    )}

                    {/* Tipo de Atendimento */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            Tipo de Atendimento<span className="text-destructive">*</span>
                        </label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => handleTipoAtendimentoChange(TIPO_ATENDIMENTO.CONSULTORIO)}
                                disabled={disabled}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all",
                                    value.tipoAtendimento === TIPO_ATENDIMENTO.CONSULTORIO
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-muted hover:border-muted-foreground/30",
                                    disabled && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <Building2 className="h-5 w-5" />
                                <span className="font-medium">{TIPO_ATENDIMENTO_LABELS.consultorio}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTipoAtendimentoChange(TIPO_ATENDIMENTO.HOMECARE)}
                                disabled={disabled}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all",
                                    value.tipoAtendimento === TIPO_ATENDIMENTO.HOMECARE
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-muted hover:border-muted-foreground/30",
                                    disabled && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <Home className="h-5 w-5" />
                                <span className="font-medium">{TIPO_ATENDIMENTO_LABELS.homecare}</span>
                            </button>
                        </div>
                    </div>

                    {/* Ajuda de Custo (só para homecare) */}
                    {value.tipoAtendimento === TIPO_ATENDIMENTO.HOMECARE && (
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
                                        "flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all",
                                        value.ajudaCusto
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-muted hover:border-muted-foreground/30",
                                        disabled && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <DollarSign className="h-5 w-5" />
                                    <span className="font-medium">Sim</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleFieldChange('ajudaCusto', false)}
                                    disabled={disabled}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all",
                                        !value.ajudaCusto
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-muted hover:border-muted-foreground/30",
                                        disabled && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <X className="h-5 w-5" />
                                    <span className="font-medium">Não</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Ajuda de Custo - Observações */}
                    <TextAreaField
                        label="Ajuda de Custo - Descrição"
                        placeholder="Ex: Estacionamento R$ 25,00 • Uber R$ 35,00 • Material impresso R$ 15,00"
                        value={value.observacaoFaturamento || ''}
                        onChange={(e) => handleFieldChange('observacaoFaturamento', e.target.value)}
                        disabled={disabled}
                        rows={1}
                    />

                    {/* Upload de Comprovantes */}
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
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 shrink-0"
                                                        onClick={() => handleRemoveFile(arquivo.id)}
                                                        disabled={disabled}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
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

export default SessionBillingData;
